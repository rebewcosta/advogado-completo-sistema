// supabase/functions/verify-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para localhost. EM PRODUÇÃO: 'https://sisjusgestao.com.br'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// SUBSTITUA 'SEU_ADMIN_USER_ID_AQUI' PELO ID REAL DO SEU USUÁRIO ADMINISTRADOR NO SUPABASE
const ADMIN_USER_ID = '5e1a2dd5-ffb9-4b8b-8f8e-ecc505c269b3'; // <<< SEU ID DE ADMIN

async function simpleHash(text: string): Promise<string> {
  const salt = Deno.env.get("PIN_SALT");
   if (!salt) {
    console.error("verify-finance-pin: PIN_SALT não está definido nas variáveis de ambiente da função!");
    throw new Error("Configuração de segurança do servidor incompleta (salt ausente) para verify.");
  }
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkUserAccessType(supabaseAdmin: SupabaseClient, userId: string, userEmail: string | undefined): Promise<{ accessGranted: boolean, accountType: string, message: string }> {
  if (!userEmail) {
    return { accessGranted: false, accountType: "Erro", message: "Email do usuário não disponível." };
  }
  // Admin e Amigos (com acesso especial direto, sem PIN e sem depender de assinatura Stripe)
  const adminEmails = ["webercostag@gmail.com"]; 
  const friendEmails = ["logo.advocacia@gmail.com", "focolaresce@gmail.com", "future.iartificial@gmail.com"]; 

  if (adminEmails.includes(userEmail)) {
    return { accessGranted: true, accountType: "Admin", message: "Acesso de Administrador." };
  }
  
  const { data: userDetailsForSpecialAccess, error: specialAccessError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (specialAccessError || !userDetailsForSpecialAccess?.user) {
    console.error('verify-finance-pin: Erro ao buscar detalhes do usuário para special_access:', specialAccessError);
  } else {
    if (userDetailsForSpecialAccess.user.user_metadata?.special_access === true || friendEmails.includes(userEmail)) {
         return { accessGranted: true, accountType: "Membro Amigo", message: "Acesso de Membro Amigo." };
    }
  }
  
  // Verificar assinatura Stripe para usuários "Membro Premium"
  const { data: userDetailsForStripe, error: stripeCheckError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (stripeCheckError || !userDetailsForStripe?.user) {
    console.error('verify-finance-pin: Erro ao buscar detalhes do usuário para verificar assinatura Stripe:', stripeCheckError);
    return { accessGranted: false, accountType: "Visitante", message: "Não foi possível verificar detalhes da assinatura." };
  }

  const userMetadata = userDetailsForStripe.user.user_metadata;
  const subscriptionStatus = userMetadata?.subscription_status;
  const accountTypeFromMeta = userMetadata?.account_type || "Visitante";

  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    if (accountTypeFromMeta === "Membro Premium" || userEmail === "teste@sisjusgestao.com.br") { // Adicionando o email de teste aqui também
        return { accessGranted: true, accountType: accountTypeFromMeta, message: `Assinatura ${subscriptionStatus}.` };
    }
  }

  return { accessGranted: false, accountType: accountTypeFromMeta, message: "Nenhuma assinatura ativa ou acesso especial encontrado." };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("verify-finance-pin: Supabase URL ou Service Role Key não encontradas.");
      return new Response("Configuração do servidor da função incompleta.", {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user || !user.email) {
      console.error("verify-finance-pin: Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o usuário tem acesso direto (Admin, Amigo, Premium)
    // Esta lógica foi movida para o início. A página Financeiro SEMPRE vai chamar esta função.
    // A função então decide se pede PIN ou não.
    const directAccess = await checkUserAccessType(supabaseAdmin, user.id, user.email);
    if (directAccess.accessGranted) {
      return new Response(JSON.stringify({ 
        verified: true, // Acesso concedido devido ao tipo de conta
        pinNotSet: !(user.user_metadata?.finance_pin_hash), // Informa se este usuário (mesmo admin/premium) configurou um PIN para si
        message: directAccess.message,
        accessType: directAccess.accountType
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Se não tem acesso direto, verificar se o usuário configurou um PIN para si mesmo
    const userPinHash = user.user_metadata?.finance_pin_hash;

    if (!userPinHash) {
      // Se o usuário não é Admin/Amigo/Premium E não configurou um PIN pessoal,
      // ele não deve ter acesso à página Financeiro, a menos que você queira um PIN global.
      // Para o modelo "cada usuário define seu PIN", se ele não definiu, o acesso é bloqueado
      // até que ele defina um. Ou, podemos permitir acesso e o front-end sugere configurar.
      // Vamos seguir: se não tem PIN configurado e não é premium/admin/amigo, acesso direto mas informa que PIN não está setado.
      return new Response(JSON.stringify({ 
        verified: true, // Acesso permitido
        pinNotSet: true, // Mas informa que o PIN não foi configurado por este usuário
        message: 'Nenhum PIN financeiro configurado para esta conta. Acesso permitido, mas considere configurar um PIN.',
        accessType: 'NoPinSet'
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Se chegou aqui, o usuário não tem acesso direto E TEM um PIN configurado.
    // Então, esperamos uma tentativa de PIN no corpo da requisição.
    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        console.error("verify-finance-pin: Erro ao parsear corpo da requisição JSON para tentativa de PIN:", e.message);
        return new Response(JSON.stringify({ error: 'Corpo da requisição inválido (esperando pinAttempt).' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    const pinAttempt = payload?.pinAttempt;

    if (!pinAttempt) {
      return new Response(JSON.stringify({ verified: false, pinRequired: true, message: 'PIN é necessário, mas a tentativa não foi fornecida.' }), {
        status: 400, // Bad Request porque esperávamos o PIN
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (typeof pinAttempt !== 'string' || pinAttempt.length !== 4) {
        return new Response(JSON.stringify({ verified: false, message: 'Formato do PIN inválido. Deve ser uma string de 4 dígitos.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const pinAttemptHashed = await simpleHash(pinAttempt);
    const isMatch = userPinHash === pinAttemptHashed;

    if (isMatch) {
      return new Response(JSON.stringify({ verified: true, message: 'PIN pessoal verificado com sucesso.', accessType: 'UserPIN' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ verified: false, message: 'PIN pessoal incorreto.' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('verify-finance-pin: Erro geral na função:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao verificar PIN.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});