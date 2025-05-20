// supabase/functions/verify-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; // Ou a versão mais recente do std que você usa
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Ou a versão que você usa

// Definição dos cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para desenvolvimento. Mude para seu domínio em produção!
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Assegure-se de que OPTIONS e POST estão aqui
};

// SUBSTITUA 'SEU_ADMIN_USER_ID_AQUI' PELO ID REAL DO SEU USUÁRIO ADMINISTRADOR NO SUPABASE
const ADMIN_USER_ID = 'lqprcsquknlegzmzdoct'; 
// Você pode encontrar o ID do usuário na tabela auth.users no seu Supabase SQL Editor,
// ou se logar como admin e no console do navegador executar: await supabase.auth.getUser() e pegar o data.user.id

// Função de hashing (DEVE SER IDÊNTICA À USADA NA FUNÇÃO set-finance-pin)
async function simpleHash(text: string): Promise<string> {
  const salt = Deno.env.get("PIN_SALT") || "default_salt_please_change_me_in_env_function_settings";
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Função para verificar assinatura/acesso especial (simulada/adaptada da sua função verificar-assinatura)
async function checkUserAccessType(supabaseAdmin: SupabaseClient, userId: string, userEmail: string | undefined): Promise<{ accessGranted: boolean, accountType: string, message: string }> {
  if (!userEmail) {
    return { accessGranted: false, accountType: "Erro", message: "Email do usuário não disponível." };
  }

  const adminEmails = ["webercostag@gmail.com"]; 
  const friendEmails = ["logo.advocacia@gmail.com", "focolaresce@gmail.com", "future.iartificial@gmail.com"]; 

  if (adminEmails.includes(userEmail)) {
    return { accessGranted: true, accountType: "Admin", message: "Acesso de Administrador." };
  }
  if (friendEmails.includes(userEmail)) {
    return { accessGranted: true, accountType: "Membro Amigo", message: "Acesso de Membro Amigo." };
  }
  
  // Verificar metadados para assinatura Stripe
  const { data: userDetails, error: userDetailsError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userDetailsError || !userDetails?.user) {
    console.error('verify-finance-pin: Erro ao buscar detalhes do usuário para verificar assinatura:', userDetailsError);
    return { accessGranted: false, accountType: "Visitante", message: "Não foi possível verificar detalhes da assinatura." };
  }

  const userMetadata = userDetails.user.user_metadata;
  const subscriptionStatus = userMetadata?.subscription_status;
  const accountTypeFromMeta = userMetadata?.account_type || "Visitante";

  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    return { accessGranted: true, accountType: accountTypeFromMeta, message: `Assinatura ${subscriptionStatus}.` };
  }

  return { accessGranted: false, accountType: accountTypeFromMeta, message: "Nenhuma assinatura ativa encontrada." };
}

serve(async (req: Request) => {
  // Tratar requisições OPTIONS (CORS preflight) explicitamente no início
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("verify-finance-pin: Supabase URL ou Service Role Key não encontradas nas variáveis de ambiente da função.");
      return new Response(JSON.stringify({ error: "Configuração do servidor da função incompleta." }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // Autenticação do usuário que está fazendo a chamada
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("verify-finance-pin: Erro ao obter usuário ou usuário não encontrado:", userError);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado ou não encontrado.' }), {
        status: 401, // Não autorizado
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar status de acesso (Admin, Amigo, Premium)
    const userAccess = await checkUserAccessType(supabaseAdmin, user.id, user.email);

    if (userAccess.accessGranted) {
      return new Response(JSON.stringify({ 
        verified: true, // Acesso concedido por status da conta
        message: userAccess.message,
        accessType: userAccess.accountType 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se não tem acesso direto, prosseguir com a lógica do PIN
    // Buscar o PIN financeiro global dos metadados do admin
    if (ADMIN_USER_ID === 'SEU_ADMIN_USER_ID_AQUI') {
        console.error("verify-finance-pin: ADMIN_USER_ID não foi configurado na função.");
         return new Response(JSON.stringify({ error: "Configuração interna do servidor (ADMIN_ID)." , verified: false, pinRequired: true, needsPinSetup: true}), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { data: adminUserData, error: adminUserError } = await supabaseAdmin.auth.admin.getUserById(ADMIN_USER_ID);
    if (adminUserError || !adminUserData?.user) {
        console.error('verify-finance-pin: Erro ao buscar dados do admin para PIN global:', adminUserError);
        return new Response(JSON.stringify({ error: 'Falha ao obter configuração de PIN.', verified: false, pinRequired: true, needsPinSetup: true }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    const globalFinancePinHash = adminUserData.user.user_metadata?.finance_pin_hash;

    if (!globalFinancePinHash) {
      return new Response(JSON.stringify({ 
        verified: false, 
        pinRequired: true, 
        needsPinSetup: true, // Indica que o admin precisa configurar o PIN
        message: 'PIN financeiro global não configurado pelo administrador.' 
      }), {
        status: 200, // HTTP 200, mas a lógica do front-end tratará needsPinSetup
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se chegou aqui, o PIN é necessário e está configurado, então esperamos uma tentativa de PIN
    const body = await req.json();
    const pinAttempt = body?.pinAttempt; // Recebe o PIN em texto plano do cliente
    const checkStatusOnly = body?.checkStatusOnly;

    // Se for apenas uma verificação de status para o front-end (e já sabemos que não é admin/premium)
    if (checkStatusOnly === true) {
        return new Response(JSON.stringify({ 
            verified: false, // Ainda não verificado, apenas informando o status
            pinRequired: true, 
            needsPinSetup: false, // PIN está configurado, só precisa ser inserido
            message: 'PIN necessário para acesso.'
        }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
    if (!pinAttempt) {
      return new Response(JSON.stringify({ error: 'Tentativa de PIN (pinAttempt) é obrigatória para verificação.' }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (typeof pinAttempt !== 'string' || pinAttempt.length !== 4) { // Validar que é string e tem 4 dígitos
        return new Response(JSON.stringify({ verified: false, message: 'Formato do PIN inválido. Deve ser uma string de 4 dígitos.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const pinAttemptHashed = await simpleHash(pinAttempt);
    const isMatch = globalFinancePinHash === pinAttemptHashed;

    if (isMatch) {
      return new Response(JSON.stringify({ verified: true, message: 'PIN verificado com sucesso.', accessType: 'PIN' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ verified: false, message: 'PIN incorreto.' }), {
        status: 200, // HTTP 200, mas com verified: false
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('verify-finance-pin: Erro geral na função:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao verificar PIN.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});