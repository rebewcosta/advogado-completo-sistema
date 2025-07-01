
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Configurar cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Iniciando criação do portal do cliente...");

    // Obter chave do Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("Chave secreta do Stripe não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do Stripe não encontrada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Token de autorização necessário" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user?.email) {
      console.error("Erro de autenticação:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("Usuário autenticado:", userData.user.email);

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.error("Cliente não encontrado no Stripe para:", userData.user.email);
      return new Response(
        JSON.stringify({ error: "Cliente não encontrado no Stripe. Faça uma assinatura primeiro." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const customerId = customers.data[0].id;
    console.log("Cliente encontrado no Stripe:", customerId);

    // Determinar URL de retorno
    const returnUrl = req.headers.get("origin") || "https://sisjusgestao.com.br";
    
    // Criar sessão do portal do cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/configuracoes`,
    });

    console.log("Portal do cliente criado:", portalSession.id);

    return new Response(
      JSON.stringify({ url: portalSession.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro ao criar portal do cliente:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "Erro ao abrir o portal de gerenciamento. Tente novamente." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
