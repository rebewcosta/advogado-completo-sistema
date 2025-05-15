
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Configurar cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function para debug
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFICAR-ASSINATURA] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Função iniciada");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Chave Stripe verificada");

    // Inicializar cliente do Supabase para autenticação
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter o token JWT da solicitação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Nenhum token de autenticação fornecido." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Verificar o usuário usando o token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
      return new Response(
        JSON.stringify({ error: `Erro de autenticação: ${userError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = userData.user;
    if (!user?.email) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado ou email não disponível." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    // Inicializar o Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Verificar se existe um cliente Stripe para este usuário
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      logStep("Nenhum cliente Stripe encontrado");
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          message: "Nenhuma assinatura encontrada para este usuário."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });
    
    // Buscar assinaturas ativas para este cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;
    
    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      logStep("Assinatura ativa encontrada", { 
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscriptionEnd
      });
      
      // Determinar o plano da assinatura
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      subscriptionTier = price.nickname || "Plano JusGestão";
      
      logStep("Plano determinado", { 
        priceId, 
        amount: price.unit_amount,
        subscriptionTier
      });
    } else {
      logStep("Nenhuma assinatura ativa encontrada");
    }
    
    return new Response(
      JSON.stringify({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "Houve um erro ao verificar sua assinatura."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
