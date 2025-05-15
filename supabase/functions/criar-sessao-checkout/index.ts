
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
      console.error("Dados incompletos para criar sessão:", { nomePlano, valor, emailCliente });
      return new Response(
        JSON.stringify({ error: "Dados incompletos para criar sessão" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // IMPORTANTE: Forçar modo de teste independente do valor recebido
    // Isto garante que sempre usaremos o ambiente de teste do Stripe
    console.log(`Processando checkout para ${emailCliente}, plano: ${nomePlano}, valor: ${valor}, modo: test (forçado)`);
    
    // Obter a chave do Stripe do ambiente - SEMPRE vamos usar a chave de teste
    // Importante: mesmo quando STRIPE_SECRET_KEY é uma chave "live", vamos garantir
    // que o modo seja de teste usando o prefixo "sk_test" no código abaixo
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("Chave de API do Stripe não configurada");
      return new Response(
        JSON.stringify({ error: "Chave de API do Stripe não configurada. Verifique as configurações do Edge Function." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Verificar e forçar o uso da chave de teste do Stripe
    let finalStripeKey = stripeSecretKey;
    if (!stripeSecretKey.startsWith('sk_test_')) {
      console.warn("Detectada chave de produção. Substituindo por uma chave de teste para demonstração.");
      // Use uma chave de teste fixa para demonstração - em produção, isso seria configurado corretamente
      finalStripeKey = 'sk_test_51OvQIeDzU3oOQJJz5qetFrlyRqSTaheaOLz6AHsVboUe1S3Wqw1e25P8JZkCtTjXxyEguLavjGVb9gOLwcCYNOeE00rVzO86sd';
    }
    
    console.log("Iniciando Stripe no modo TESTE (forçado)");
    
    const stripe = new Stripe(finalStripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log("Criando sessão de checkout...");
    
    // Criar a sessão de checkout com redireciomento para a página de sucesso
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: emailCliente,
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
      success_url: `${req.headers.get("origin")}/pagamento-sucesso`,
      cancel_url: `${req.headers.get("origin")}/pagamento?canceled=true`,
    });

    console.log(`Sessão de checkout criada: ${session.id}, URL: ${session.url}`);

    // Retornar o ID da sessão e URL
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    
    // Retornar detalhes de erro mais específicos para facilitar o debug
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    const errorDetails = error instanceof Error && error.stack ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
        message: "Houve um erro ao processar o pagamento. Por favor, verifique os logs para mais detalhes."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
