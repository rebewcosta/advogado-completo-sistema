import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  console.log(`🚀 [CHECKOUT] ${new Date().toISOString()} - Nova requisição`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ [CHECKOUT] CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar método
    if (req.method !== "POST") {
      console.error("❌ [CHECKOUT] Método inválido:", req.method);
      return new Response(
        JSON.stringify({ error: "Apenas POST é permitido" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 405 
        }
      );
    }

    // Verificar chave do Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log(`🔑 [CHECKOUT] Stripe key: ${stripeSecretKey ? 'PRESENTE' : 'AUSENTE'}`);
    
    if (!stripeSecretKey) {
      console.error("❌ [CHECKOUT] STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Chave do Stripe não configurada" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Ler corpo da requisição
    const body = await req.text();
    console.log(`📥 [CHECKOUT] Body: ${body}`);

    if (!body || body.trim() === "") {
      console.error("❌ [CHECKOUT] Body vazio");
      return new Response(
        JSON.stringify({ error: "Dados da requisição não encontrados" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Parse JSON
    let requestData;
    try {
      requestData = JSON.parse(body);
      console.log(`📊 [CHECKOUT] Dados parseados:`, requestData);
    } catch (parseError) {
      console.error("❌ [CHECKOUT] Erro no parse JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "JSON inválido" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Validar email
    const emailCliente = requestData?.emailCliente;
    
    if (!emailCliente) {
      console.error("❌ [CHECKOUT] Email não fornecido");
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const emailTrimmed = emailCliente.trim().toLowerCase();
    console.log(`✅ [CHECKOUT] Email: ${emailTrimmed}`);

    // Inicializar Stripe
    console.log("🔧 [CHECKOUT] Inicializando Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Detectar ambiente
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const isProduction = origin.includes('sisjusgestao.com.br');
    
    console.log(`🏷️ [CHECKOUT] Origin: ${origin}`);
    console.log(`🏷️ [CHECKOUT] Produção: ${isProduction}`);

    // URLs de redirecionamento
    const baseUrl = isProduction ? "https://sisjusgestao.com.br" : origin;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/pagamento`;
    
    console.log(`🔗 [CHECKOUT] Success: ${successUrl}`);
    console.log(`🔗 [CHECKOUT] Cancel: ${cancelUrl}`);

    // Criar sessão de checkout
    console.log("🔄 [CHECKOUT] Criando sessão...");
    const session = await stripe.checkout.sessions.create({
      customer_email: emailTrimmed,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "JusGestão Premium",
              description: "Sistema completo de gestão jurídica - 7 dias gratuitos"
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
        trial_period_days: 7,
        metadata: {
          email: emailTrimmed,
          environment: isProduction ? "production" : "test"
        }
      },
      metadata: {
        email: emailTrimmed,
        environment: isProduction ? "production" : "test"
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto"
    });
    
    console.log(`✅ [CHECKOUT] Sessão criada: ${session.id}`);
    console.log(`🔗 [CHECKOUT] URL: ${session.url}`);

    if (!session.url) {
      throw new Error("URL da sessão não foi gerada");
    }

    // Resposta de sucesso
    const response = {
      success: true,
      url: session.url,
      sessionId: session.id,
      ambiente: isProduction ? "PRODUÇÃO" : "TESTE",
      trialDays: 7,
      message: "Sessão criada com sucesso!"
    };

    console.log(`🎉 [CHECKOUT] Sucesso:`, response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("💥 [CHECKOUT] ERRO:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});