
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
    // Obter os dados do corpo da solicitação
    const { nomePlano, valor, emailCliente, modo = 'test' } = await req.json();
    
    // Validar os dados necessários
    if (!nomePlano || !valor || !emailCliente) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos para criar sessão" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log para debug
    console.log(`Processando checkout para ${emailCliente}, plano: ${nomePlano}, valor: ${valor}, modo: ${modo}`);
    
    // Inicializar o Stripe com a chave secreta (armazenada como variável de ambiente)
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY não configurada no ambiente");
      return new Response(
        JSON.stringify({ error: "Configuração de pagamento incompleta" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Criar a sessão de checkout diretamente sem verificar cliente existente
    // Isso contorna o problema de permissões da chave restrita
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: emailCliente, // Usar email do cliente diretamente
      line_items: [
        {
          price_data: {
            currency: "brl", // Moeda brasileira
            product_data: {
              name: nomePlano,
            },
            unit_amount: valor, // Valor em centavos
            recurring: {
              interval: "month", // Assinatura mensal
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription", // Modo de assinatura
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pagamento?canceled=true`,
    });

    console.log(`Sessão de checkout criada: ${session.id}, URL: ${session.url}`);

    // Retornar o ID da sessão
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
