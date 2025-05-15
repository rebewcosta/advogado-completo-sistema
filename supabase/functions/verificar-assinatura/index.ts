
// Este arquivo é um edge function do Supabase para verificar o status da assinatura de um usuário
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.5.0?dts";

// Obter variáveis de ambiente
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const customDomain = Deno.env.get("CUSTOM_DOMAIN") || "sisjusgestao.com.br";

// Inicializar clientes
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Cabeçalhos CORS para permitir requisições de qualquer origem
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lista de e-mails com acesso especial gratuito
// Esta lista pode ser expandida conforme necessário
const specialAccessEmails = [
  "teste@sisjusgestao.com.br",
  "webercostag@gmail.com", 
  // Adicione mais e-mails conforme necessário
];

// Função principal que é executada quando a edge function é chamada
Deno.serve(async (req) => {
  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Obter o token de autorização do cabeçalho
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Faltando token de autorização");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Verificar a sessão do usuário
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Erro ao verificar usuário:", userError);
      throw new Error("Usuário não autenticado");
    }
    
    console.log("Verificando acesso para usuário:", user.email);
    
    // Verificação detalhada para o email webercostag@gmail.com
    if (user.email === "webercostag@gmail.com") {
      console.log("Acesso especial concedido para webercostag@gmail.com (verificação exata)");
      
      // Retornar resposta simulando assinatura ativa para este usuário específico
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      return new Response(
        JSON.stringify({
          subscribed: true,
          subscription_status: "active",
          current_period_end: oneYearFromNow.toISOString(),
          message: "Acesso especial ativo para webercostag@gmail.com",
          special_access: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Verificar se o usuário tem acesso especial por e-mail
    if (user.email && specialAccessEmails.includes(user.email)) {
      console.log("Acesso especial concedido para:", user.email);
      
      // Verificar também user metadata para special_access
      const hasSpecialAccessMetadata = user.user_metadata?.special_access === true;
      console.log("Metadados do usuário:", JSON.stringify(user.user_metadata));
      console.log("Special access nos metadados:", hasSpecialAccessMetadata);
      
      // Retornar resposta simulando assinatura ativa para usuários especiais
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      return new Response(
        JSON.stringify({
          subscribed: true,
          subscription_status: "active",
          current_period_end: oneYearFromNow.toISOString(),
          message: "Acesso especial ativo",
          special_access: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Verificar se user.user_metadata contém special_access = true
    if (user.user_metadata && user.user_metadata.special_access === true) {
      console.log("Acesso especial encontrado nos metadados para:", user.email);
      
      // Retornar resposta simulando assinatura ativa para usuários com special_access
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      return new Response(
        JSON.stringify({
          subscribed: true,
          subscription_status: "active",
          current_period_end: oneYearFromNow.toISOString(),
          message: "Acesso especial ativo via metadados",
          special_access: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Obter informações do usuário
    const { subscription_id: subscriptionId } = user.user_metadata || {};
    
    // Verificar se o usuário tem uma assinatura
    if (!subscriptionId) {
      console.log("Nenhuma assinatura encontrada para:", user.email);
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          message: "Nenhuma assinatura encontrada" 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Recuperar informações da assinatura do Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Verificar se a assinatura está ativa
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    
    // Formatar data de expiração para o cliente
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    return new Response(
      JSON.stringify({
        subscribed: isActive,
        subscription_status: subscription.status,
        current_period_end: currentPeriodEnd,
        message: isActive ? "Assinatura ativa" : "Assinatura inativa"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    // Log de erro para debug
    console.error(`Erro ao verificar assinatura: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        subscribed: false,
        message: "Erro ao verificar assinatura",
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }
});
