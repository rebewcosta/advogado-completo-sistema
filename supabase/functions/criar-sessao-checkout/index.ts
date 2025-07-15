import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  emailCliente: string;
}

serve(async (req: Request) => {
  console.log(`🚀 [CHECKOUT] ${new Date().toISOString()} - Requisição recebida`);
  console.log(`📋 [CHECKOUT] Método: ${req.method}`);
  console.log(`📋 [CHECKOUT] Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ [CHECKOUT] Respondendo CORS preflight");
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
    console.log(`🔑 [CHECKOUT] Stripe key presente: ${stripeSecretKey ? 'SIM' : 'NÃO'}`);
    
    if (!stripeSecretKey) {
      console.error("❌ [CHECKOUT] STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta - entre em contato com o suporte" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Ler corpo da requisição
    const body = await req.text();
    console.log(`📥 [CHECKOUT] Body recebido: ${body}`);

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
    let requestData: CheckoutRequest;
    try {
      requestData = JSON.parse(body) as CheckoutRequest;
      console.log(`📊 [CHECKOUT] Dados parseados: ${JSON.stringify(requestData)}`);
    } catch (parseError) {
      console.error("❌ [CHECKOUT] Erro ao fazer parse do JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Dados inválidos - JSON malformado" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Validar email
    const { emailCliente } = requestData;
    
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

    if (typeof emailCliente !== 'string') {
      console.error("❌ [CHECKOUT] Email não é string:", typeof emailCliente);
      return new Response(
        JSON.stringify({ error: "Email deve ser uma string válida" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const emailTrimmed = emailCliente.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(emailTrimmed)) {
      console.error("❌ [CHECKOUT] Email com formato inválido:", emailTrimmed);
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    console.log(`✅ [CHECKOUT] Email validado: ${emailTrimmed}`);

    // Inicializar Stripe
    console.log("🔧 [CHECKOUT] Inicializando Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    console.log("✅ [CHECKOUT] Stripe inicializado com sucesso");

    // Detectar ambiente
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('127.0.0.1') &&
                        !origin.includes('lovableproject.com');
    
    console.log(`🏷️ [CHECKOUT] Origin: ${origin}`);
    console.log(`🏷️ [CHECKOUT] Ambiente detectado: ${isProduction ? "PRODUÇÃO" : "TESTE"}`);

    // URLs de redirecionamento
    const baseUrl = origin || "https://sisjusgestao.com.br";
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/pagamento`;
    
    console.log(`🔗 [CHECKOUT] Success URL: ${successUrl}`);
    console.log(`🔗 [CHECKOUT] Cancel URL: ${cancelUrl}`);

    // Configuração da sessão de checkout
    const sessionConfig = {
      customer_email: emailTrimmed,
      payment_method_types: ["card"] as const,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "JusGestão Premium",
              description: "Sistema completo de gestão jurídica - 7 dias gratuitos"
            },
            unit_amount: 3700, // R$ 37,00 em centavos
            recurring: {
              interval: "month" as const
            }
          },
          quantity: 1
        }
      ],
      mode: "subscription" as const,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          email: emailTrimmed,
          environment: isProduction ? "production" : "test",
          trial_days: "7"
        }
      },
      metadata: {
        email: emailTrimmed,
        environment: isProduction ? "production" : "test",
        trial_days: "7"
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto" as const
    };

    console.log(`⚙️ [CHECKOUT] Configuração preparada: ${JSON.stringify(sessionConfig, null, 2)}`);

    // Criar sessão
    console.log("🔄 [CHECKOUT] Criando sessão no Stripe...");
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log(`✅ [CHECKOUT] Sessão criada com sucesso!`);
    console.log(`🆔 [CHECKOUT] Session ID: ${session.id}`);
    console.log(`🔗 [CHECKOUT] Session URL: ${session.url}`);

    if (!session.url) {
      console.error("❌ [CHECKOUT] URL da sessão não foi gerada");
      throw new Error("Falha ao gerar URL de checkout");
    }

    // Resposta de sucesso
    const response = {
      success: true,
      url: session.url,
      sessionId: session.id,
      ambiente: isProduction ? "PRODUÇÃO" : "TESTE",
      trialDays: 7,
      message: "Sessão de checkout criada com sucesso! 7 dias gratuitos."
    };

    console.log(`🎉 [CHECKOUT] Resposta de sucesso: ${JSON.stringify(response)}`);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("💥 [CHECKOUT] ERRO CRÍTICO:", error);
    
    let errorMessage = "Erro interno do servidor";
    let errorDetails = "";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
      console.error(`💥 [CHECKOUT] Stack: ${errorDetails}`);
    }

    console.error(`💥 [CHECKOUT] Retornando erro: ${errorMessage}`);

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        details: "Erro ao processar checkout. Entre em contato com o suporte se o problema persistir."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});