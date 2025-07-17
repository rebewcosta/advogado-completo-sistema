import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting simples - máximo 30 requests por minuto por IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (clientIP: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 30;

  const current = rateLimitMap.get(clientIP) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  rateLimitMap.set(clientIP, current);
  return current.count <= maxRequests;
};

serve(async (req: Request) => {
  // Log requisição
  console.log(`🚀 [CHECKOUT] ${new Date().toISOString()} - Nova requisição ${req.method}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ [CHECKOUT] CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }
  
  // Rate limiting
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { 
      status: 429, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
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

    // Detectar ambiente
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const isProduction = origin.includes('sisjusgestao.com.br');
    
    console.log(`🏷️ [CHECKOUT] Origin: ${origin}`);
    console.log(`🏷️ [CHECKOUT] É produção: ${isProduction}`);

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
    let body;
    try {
      body = await req.text();
      console.log(`📥 [CHECKOUT] Body recebido: ${body}`);
    } catch (e) {
      console.error("❌ [CHECKOUT] Erro ao ler body:", e);
      return new Response(
        JSON.stringify({ error: "Erro ao ler dados da requisição" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

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
      console.log(`📊 [CHECKOUT] Dados parseados:`, JSON.stringify(requestData, null, 2));
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
      console.error("❌ [CHECKOUT] Email não fornecido. Dados recebidos:", requestData);
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const emailTrimmed = emailCliente.trim().toLowerCase();
    console.log(`✅ [CHECKOUT] Email válido: ${emailTrimmed}`);

    // Inicializar Stripe
    console.log("🔧 [CHECKOUT] Inicializando Stripe...");
    let stripe;
    try {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });
      console.log("✅ [CHECKOUT] Stripe inicializado com sucesso");
    } catch (stripeError) {
      console.error("❌ [CHECKOUT] Erro ao inicializar Stripe:", stripeError);
      return new Response(
        JSON.stringify({ error: "Erro na configuração do Stripe" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // URLs de redirecionamento
    const baseUrl = isProduction ? "https://sisjusgestao.com.br" : origin;
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/pagamento`;
    
    console.log(`🔗 [CHECKOUT] Success URL: ${successUrl}`);
    console.log(`🔗 [CHECKOUT] Cancel URL: ${cancelUrl}`);

    // Criar sessão de checkout
    console.log("🔄 [CHECKOUT] Criando sessão do Stripe...");
    
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer_email: emailTrimmed,
        payment_method_types: ["card"],
        line_items: [
          {
            price: isProduction ? "price_1RfoO5Kr3xy0fCEP5COgihuw" : "price_1QQKh6FJ3Y1S0P0BSZVwNKa6",
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
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
    } catch (stripeSessionError) {
      console.error("❌ [CHECKOUT] Erro ao criar sessão do Stripe:", stripeSessionError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar sessão de pagamento" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    if (!session.url) {
      console.error("❌ [CHECKOUT] URL da sessão não foi gerada");
      return new Response(
        JSON.stringify({ error: "URL da sessão não foi gerada" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Resposta de sucesso
    const response = {
      success: true,
      url: session.url,
      sessionId: session.id,
      ambiente: isProduction ? "PRODUÇÃO" : "TESTE",
      message: "Sessão criada com sucesso!"
    };

    console.log(`🎉 [CHECKOUT] Resposta de sucesso:`, JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("💥 [CHECKOUT] ERRO GERAL:", error);
    
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