// supabase/functions/set-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para sisjusgestao.com.br, mude para 'https://sisjusgestao.com.br' em produção
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function simpleHash(text: string, salt: string): Promise<string> {
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  console.log(`set-finance-pin (VERSÃO COMPLETA): Função INVOCADA. Método: ${req.method}, URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log("set-finance-pin (VERSÃO COMPLETA): Requisição OPTIONS. Respondendo com headers CORS.");
    return new Response('ok', { status: 204, headers: corsHeaders });
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pinSalt = Deno.env.get('PIN_SALT');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("set-finance-pin (VERSÃO COMPLETA): ERRO - SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas!");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }
    if (!pinSalt) {
      console.error("set-finance-pin (VERSÃO COMPLETA): ERRO CRÍTICO - PIN_SALT não configurado!");
      return new Response(JSON.stringify({ error: "Configuração de segurança crítica (PIN_SALT) ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("set-finance-pin (VERSÃO COMPLETA): Chamada sem token ou malformado.");
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error("set-finance-pin (VERSÃO COMPLETA): Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    console.log(`set-finance-pin (VERSÃO COMPLETA): Usuário ${user.id} autenticado.`);

    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        console.error("set-finance-pin (VERSÃO COMPLETA): Erro ao parsear corpo JSON:", e.message);
        return new Response(JSON.stringify({ error: 'Corpo da requisição inválido (não é JSON).' }), {
            status: 400, headers: responseHeaders,
        });
    }
    const { currentPin, newPin } = payload;
    console.log("set-finance-pin (VERSÃO COMPLETA): Payload:", { currentPin: "****", newPin: "****" });


    if (!newPin || typeof newPin !== 'string' || newPin.length !== 4) {
      return new Response(JSON.stringify({ error: 'Novo PIN é obrigatório e deve ser uma string de 4 dígitos.' }), {
        status: 400, headers: responseHeaders,
      });
    }

    const existingPinHash = user.user_metadata?.finance_pin_hash;
    if (existingPinHash) {
      if (!currentPin || typeof currentPin !== 'string' || currentPin.length !== 4) {
        return new Response(JSON.stringify({ error: 'PIN atual (4 dígitos) é obrigatório para alterar PIN existente.' }), {
          status: 400, headers: responseHeaders,
        });
      }
      const currentPinHashAttempt = await simpleHash(currentPin, pinSalt);
      if (existingPinHash !== currentPinHashAttempt) {
        console.warn("set-finance-pin (VERSÃO COMPLETA): PIN atual incorreto.");
        return new Response(JSON.stringify({ error: 'PIN atual incorreto.' }), {
          status: 403, headers: responseHeaders,
        });
      }
    }

    const newPinHashed = await simpleHash(newPin, pinSalt);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, finance_pin_hash: newPinHashed } }
    );

    if (updateError) {
      console.error("set-finance-pin (VERSÃO COMPLETA): Erro ao atualizar metadados:", updateError.message);
      return new Response(JSON.stringify({ error: `Erro ao atualizar PIN: ${updateError.message}` }), {
        status: 500, headers: responseHeaders,
      });
    }

    console.log("set-finance-pin (VERSÃO COMPLETA): PIN atualizado com sucesso para usuário:", user.id);
    return new Response(JSON.stringify({ message: 'PIN financeiro atualizado com sucesso.' }), {
      status: 200, headers: responseHeaders,
    });

  } catch (error) {
    console.error('set-finance-pin (VERSÃO COMPLETA): ERRO INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno crítico do servidor ao definir PIN.' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
});