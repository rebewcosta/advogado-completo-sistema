// supabase/functions/set-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handleCors = () => {
  return new Response(null, { // Alterado para null, status 204 é mais comum para OPTIONS bem-sucedido sem corpo
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*', // Para desenvolvimento. EM PRODUÇÃO: 'https://sisjusgestao.com.br'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Max-Age': '86400', // Cache da preflight request por 24h (opcional)
    },
  });
};

async function simpleHash(text: string, salt: string): Promise<string> {
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  console.log(`set-finance-pin: Função recebida. Método: ${req.method}, URL: ${req.url}`);

  // Tratamento explícito e imediato para OPTIONS
  if (req.method === 'OPTIONS') {
    console.log("set-finance-pin: Recebida requisição OPTIONS. Respondendo com headers CORS.");
    return handleCors();
  }

  // Definindo os headers para as respostas POST (e erros)
  const responseHeaders = {
    'Access-Control-Allow-Origin': '*', // Mantenha consistente com handleCors
    'Content-Type': 'application/json',
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pinSalt = Deno.env.get('PIN_SALT');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("set-finance-pin: ERRO - SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas!");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }
    if (!pinSalt) {
      console.error("set-finance-pin: ERRO CRÍTICO - PIN_SALT não configurado!");
      return new Response(JSON.stringify({ error: "Configuração de segurança crítica (PIN_SALT) ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    console.log(`set-finance-pin: Usuário ${user.id} autenticado.`);

    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Corpo da requisição inválido (não é JSON).' }), {
            status: 400, headers: responseHeaders,
        });
    }
    const { currentPin, newPin } = payload;

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
      console.error("set-finance-pin: Erro ao atualizar metadados:", updateError.message);
      return new Response(JSON.stringify({ error: `Erro ao atualizar PIN: ${updateError.message}` }), {
        status: 500, headers: responseHeaders,
      });
    }

    console.log("set-finance-pin: PIN atualizado com sucesso para usuário:", user.id);
    return new Response(JSON.stringify({ message: 'PIN financeiro atualizado com sucesso.' }), {
      status: 200, headers: responseHeaders,
    });

  } catch (error) {
    console.error('set-finance-pin: ERRO INESPERADO NA FUNÇÃO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno crítico do servidor ao definir PIN.' }), {
      status: 500,
      headers: responseHeaders, // Garante CORS mesmo em erros inesperados
    });
  }
});