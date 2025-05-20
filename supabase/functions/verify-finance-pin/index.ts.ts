// supabase/functions/verify-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para localhost. EM PRODUÇÃO: 'https://sisjusgestao.com.br'
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
  console.log(`verify-finance-pin: Função INVOCADA. Método: ${req.method}, URL: ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log("verify-finance-pin: Requisição OPTIONS. Respondendo com status 204 e headers CORS.");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pinSalt = Deno.env.get('PIN_SALT');

    if (!supabaseUrl || !serviceRoleKey || !pinSalt) {
      console.error("verify-finance-pin: ERRO - Variáveis de ambiente críticas ausentes.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
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
      console.error("verify-finance-pin: Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    console.log(`verify-finance-pin: Usuário ${user.id} autenticado.`);

    const userPinHash = user.user_metadata?.finance_pin_hash;

    // Se o usuário (qualquer usuário, incluindo admin) NÃO configurou um PIN pessoal,
    // o acesso é permitido, mas o front-end será informado para sugerir a configuração.
    if (!userPinHash) {
      console.log(`verify-finance-pin: Usuário ${user.id} não tem PIN configurado. Acesso permitido.`);
      return new Response(JSON.stringify({ 
        verified: true, 
        pinNotSet: true, 
        message: 'Nenhum PIN financeiro configurado para esta conta. Acesso permitido.' 
      }), { status: 200, headers: responseHeaders });
    }

    // Se um PIN está configurado para este usuário, ele é OBRIGATÓRIO.
    // Esperamos uma tentativa de PIN no corpo da requisição.
    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        // Se não há corpo JSON e um PIN é esperado, isso é um erro do cliente.
        console.warn(`verify-finance-pin: Usuário ${user.id} tem PIN, mas não foi fornecido pinAttempt no corpo JSON.`);
        return new Response(JSON.stringify({ 
            verified: false, 
            pinRequired: true, // Indica que um PIN é necessário
            pinNotSet: false,  // O PIN está configurado
            message: 'PIN é necessário para acesso. Tentativa de PIN não fornecida no corpo da requisição.' 
        }), {
            status: 400, // Bad Request
            headers: responseHeaders,
        });
    }
    const pinAttempt = payload?.pinAttempt;

    if (!pinAttempt) {
      return new Response(JSON.stringify({ verified: false, pinRequired: true, pinNotSet: false, message: 'Tentativa de PIN (pinAttempt) é obrigatória.' }), {
        status: 400, headers: responseHeaders,
      });
    }

    if (typeof pinAttempt !== 'string' || pinAttempt.length !== 4) {
        return new Response(JSON.stringify({ verified: false, message: 'Formato do PIN inválido. Deve ser uma string de 4 dígitos.' }), {
            status: 400, headers: responseHeaders,
        });
    }

    const pinAttemptHashed = await simpleHash(pinAttempt, pinSalt);
    const isMatch = userPinHash === pinAttemptHashed;

    if (isMatch) {
      console.log(`verify-finance-pin: PIN pessoal verificado com sucesso para usuário ${user.id}.`);
      return new Response(JSON.stringify({ verified: true, message: 'PIN pessoal verificado com sucesso.' }), {
        status: 200, headers: responseHeaders,
      });
    } else {
      console.warn(`verify-finance-pin: Tentativa de PIN pessoal incorreta para usuário ${user.id}.`);
      return new Response(JSON.stringify({ verified: false, message: 'PIN pessoal incorreto.' }), {
        status: 200, // HTTP 200, mas com verified: false
        headers: responseHeaders,
      });
    }

  } catch (error) {
    console.error('verify-finance-pin: ERRO GERAL INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao verificar PIN.' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
});