// supabase/functions/verify-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
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

    if (!supabaseUrl || !serviceRoleKey ) {
      console.error("verify-finance-pin: ERRO - Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente (URL/KEY)." }), {
        status: 500, headers: responseHeaders,
      });
    }
    if (!pinSalt) {
      console.error("verify-finance-pin: ERRO CRÍTICO - PIN_SALT não configurado nas variáveis de ambiente da função!");
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
      console.error("verify-finance-pin: Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    console.log(`verify-finance-pin: Usuário ${user.id} autenticado.`);

    const userPinHash = user.user_metadata?.finance_pin_hash;

    if (!userPinHash) {
      console.log(`verify-finance-pin: Usuário ${user.id} não tem PIN configurado. Acesso permitido (pinNotSet).`);
      return new Response(JSON.stringify({ 
        verified: true, 
        pinNotSet: true, 
        message: 'Nenhum PIN financeiro configurado para esta conta. Acesso permitido.' 
      }), { status: 200, headers: responseHeaders });
    }
    
    console.log(`verify-finance-pin: Usuário ${user.id} tem PIN configurado. Esperando pinAttempt.`);
    let payload;
    try {
        // Só tenta ler o corpo se não for uma chamada inicial de verificação de status
        // (que o front-end agora faz sem corpo para verify-finance-pin)
        // Se o método não for GET e houver um content-type, assume-se que há um corpo
        if (req.method !== 'GET' && req.headers.get('content-type')) {
            payload = await req.json();
        } else {
            // Para a chamada inicial da FinanceiroPage (sem corpo), pinAttempt será undefined.
            // A lógica abaixo tratará isso se um PIN for necessário.
            console.log(`verify-finance-pin: Chamada para usuário ${user.id} sem corpo JSON (provável verificação inicial).`);
        }
    } catch (e) {
        console.warn(`verify-finance-pin: Erro ao parsear corpo JSON para pinAttempt (ou corpo inesperado): ${e.message}. Usuário ${user.id}.`);
         // Se não conseguiu ler o corpo e um PIN é esperado, solicita o PIN.
        return new Response(JSON.stringify({ 
            verified: false, 
            pinRequired: true,
            pinNotSet: false,  
            message: 'PIN é necessário. Erro ao processar tentativa.' 
        }), {
            status: 400, 
            headers: responseHeaders,
        });
    }
    const pinAttempt = payload?.pinAttempt;

    // Se userPinHash existe, E não recebemos um pinAttempt (o PinLock deveria ter enviado)
    if (!pinAttempt) {
      console.warn(`verify-finance-pin: Usuário ${user.id} tem PIN, mas pinAttempt não foi encontrado no payload. Respondendo que PIN é necessário.`);
      return new Response(JSON.stringify({ 
          verified: false, 
          pinRequired: true, // Indica que um PIN é necessário
          pinNotSet: false,  // O PIN está configurado
          message: 'PIN é necessário para acesso.' 
      }), {
        status: 200, // HTTP 200, o front-end decide mostrar o PinLock
        headers: responseHeaders,
      });
    }


    if (typeof pinAttempt !== 'string' || pinAttempt.length !== 4) {
        console.warn(`verify-finance-pin: Formato de pinAttempt inválido para usuário ${user.id}. Recebido: '${pinAttempt}'`);
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
        status: 200, headers: responseHeaders,
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