
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🚀 [CHECKOUT] Função iniciada");

  try {
    // Verificar se é POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }

    // Verificar STRIPE_SECRET_KEY
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY não encontrada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Ler e validar request body
    const body = await req.text();
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Body da requisição vazio" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "JSON inválido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { emailCliente } = requestData;
    
    // Validar email
    if (!emailCliente || typeof emailCliente !== 'string') {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailCliente.trim())) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("✅ Email validado:", emailCliente);

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Detectar ambiente
    const origin = req.headers.get("origin") || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('127.0.0.1');

    console.log("🏷️ Ambiente:", isProduction ? "PRODUÇÃO" : "TESTE");

    // URLs de redirecionamento
    const baseUrl = origin || "https://sisjusgestao.com.br";
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/pagamento`;

    // Criar sessão de checkout com price_data ao invés de price ID
    const sessionConfig = {
      customer_email: emailCliente,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "JusGestão Premium",
              description: "Sistema de gestão jurídica completo"
            },
            unit_amount: 3700, // R$ 37,00
            recurring: {
              interval: "month"
            }
          },
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 7
      },
      allow_promotion_codes: true
    };

    console.log("🔄 Criando sessão de checkout...");
    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      throw new Error("URL da sessão não foi gerada");
    }

    console.log("✅ Sessão criada:", session.id);
    console.log("🔗 URL:", session.url)

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        success: true,
        ambiente: isProduction ? 'PRODUÇÃO' : 'TESTE',
        trialDays: 7,
        message: "Sessão criada com 7 dias gratuitos!"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("❌ Erro:", error);
    
    let errorMessage = "Erro ao processar pagamento";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
