// supabase/functions/set-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; // Use a versão do seu projeto
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Use a versão do seu projeto

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Mude para 'https://sisjusgestao.com.br' em produção
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Adicionado 'apikey' e 'x-client-info' que o Supabase usa
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function simpleHash(text: string, salt: string): Promise<string> {
  // A função simpleHash permanece a mesma da versão anterior
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  console.log(`set-finance-pin: Invocada. Método: ${req.method}, URL: ${req.url}`);

  // Resposta CORS para requisições OPTIONS deve ser imediata e explícita.
  if (req.method === 'OPTIONS') {
    console.log("set-finance-pin: Requisição OPTIONS. Respondendo com status 204 e headers CORS.");
    return new Response(null, { // Corpo NULO para OPTIONS
      status: 204, // No Content - Resposta padrão para preflight bem-sucedida
      headers: corsHeaders,
    });
  }

  // Headers para respostas POST e erros
  const responseContentTypeHeaders = {
    ...corsHeaders, // Inclui todos os headers CORS
    'Content-Type': 'application/json',
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pinSalt = Deno.env.get('PIN_SALT');

    if (!supabaseUrl || !serviceRoleKey || !pinSalt) {
      console.error("set-finance-pin: Variáveis de ambiente críticas ausentes (URL, KEY ou PIN_SALT).");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseContentTypeHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401, headers: responseContentTypeHeaders,
      });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseContentTypeHeaders,
      });
    }
    console.log(`set-finance-pin: Usuário ${user.id} autenticado.`);

    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Corpo da requisição inválido (não é JSON).' }), {
            status: 400, headers: responseContentTypeHeaders,
        });
    }
    const { currentPin, newPin } = payload;
    console.log("set-finance-pin: Payload:", { currentPin: "****", newPin: "****" });


    if (!newPin || typeof newPin !== 'string' || newPin.length !== 4) {
      return new Response(JSON.stringify({ error: 'Novo PIN é obrigatório e deve ser uma string de 4 dígitos.' }), {
        status: 400, headers: responseContentTypeHeaders,
      });
    }

    const existingPinHash = user.user_metadata?.finance_pin_hash;
    if (existingPinHash) {
      if (!currentPin || typeof currentPin !== 'string' || currentPin.length !== 4) {
        return new Response(JSON.stringify({ error: 'PIN atual (4 dígitos) é obrigatório para alterar PIN existente.' }), {
          status: 400, headers: responseContentTypeHeaders,
        });
      }
      const currentPinHashAttempt = await simpleHash(currentPin, pinSalt);
      if (existingPinHash !== currentPinHashAttempt) {
        return new Response(JSON.stringify({ error: 'PIN atual incorreto.' }), {
          status: 403, headers: responseContentTypeHeaders,
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
        status: 500, headers: responseContentTypeHeaders,
      });
    }

    console.log("set-finance-pin: PIN atualizado com sucesso para usuário:", user.id);
    return new Response(JSON.stringify({ message: 'PIN financeiro atualizado com sucesso.' }), {
      status: 200, headers: responseContentTypeHeaders,
    });

  } catch (error) {
    console.error('set-finance-pin: ERRO INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno crítico do servidor.' }), {
      status: 500,
      headers: responseContentTypeHeaders, // Garante CORS mesmo em erros inesperados
    });
  }
});