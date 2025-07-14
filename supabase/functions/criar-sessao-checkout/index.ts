
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Configurar cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 [CHECKOUT] Iniciando função criar-sessao-checkout");
    console.log("🌐 [CHECKOUT] Method:", req.method);
    console.log("🌐 [CHECKOUT] Headers:", Object.fromEntries(req.headers.entries()));

    // Verificar método HTTP
    if (req.method !== "POST") {
      console.error("❌ [CHECKOUT] Método não permitido:", req.method);
      return new Response(
        JSON.stringify({ error: "Método não permitido. Use POST." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 405 
        }
      );
    }

    // Verificar chaves de ambiente CRÍTICAS
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey) {
      console.error("❌ [CHECKOUT] STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do Stripe não encontrada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ [CHECKOUT] Configurações do Supabase não encontradas");
      return new Response(
        JSON.stringify({ error: "Configuração do banco de dados não encontrada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ [CHECKOUT] Chaves de ambiente verificadas");

    // Processar dados do corpo da requisição
    let requestData;
    try {
      const bodyText = await req.text();
      console.log("📝 [CHECKOUT] Body recebido:", bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error("Corpo da requisição vazio");
      }
      
      requestData = JSON.parse(bodyText);
      console.log("📋 [CHECKOUT] Dados parseados:", requestData);
    } catch (parseError) {
      console.error("❌ [CHECKOUT] Erro ao processar JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Dados da requisição inválidos ou malformados" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Extrair e validar dados obrigatórios
    const { emailCliente, nomePlano, valor, dominio, clientReferenceId } = requestData;
    
    console.log("🔍 [CHECKOUT] Validando dados:", {
      emailCliente,
      nomePlano,
      valor,
      dominio,
      clientReferenceId
    });

    // Validação rigorosa do email
    if (!emailCliente || typeof emailCliente !== 'string' || !emailCliente.trim()) {
      console.error("❌ [CHECKOUT] Email inválido ou não fornecido:", emailCliente);
      return new Response(
        JSON.stringify({ error: "Email é obrigatório e deve ser válido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailCliente.trim())) {
      console.error("❌ [CHECKOUT] Formato de email inválido:", emailCliente);
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const emailLimpo = emailCliente.trim().toLowerCase();
    console.log("✅ [CHECKOUT] Email validado:", emailLimpo);

    // Verificar autenticação opcional
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        console.log("🔐 [CHECKOUT] Verificando autenticação...");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (!userError && userData.user) {
          user = userData.user;
          console.log("✅ [CHECKOUT] Usuário autenticado:", user.email);
        } else {
          console.log("⚠️ [CHECKOUT] Token inválido, continuando como usuário anônimo");
        }
      } catch (authError) {
        console.log("⚠️ [CHECKOUT] Erro na autenticação, continuando como usuário anônimo:", authError);
      }
    }

    // Determinar ambiente de produção
    const origin = req.headers.get("origin") || dominio || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('lovableproject.com') &&
                        !origin.includes('127.0.0.1');
    
    console.log("🏷️ [CHECKOUT] Ambiente detectado:", isProduction ? "PRODUÇÃO" : "TESTE");
    console.log("🌐 [CHECKOUT] Origin:", origin);

    // Inicializar Stripe
    console.log("💳 [CHECKOUT] Inicializando Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verificar/criar cliente no Stripe
    let stripeCustomerId = null;
    try {
      console.log("👤 [CHECKOUT] Verificando cliente existente no Stripe...");
      const existingCustomers = await stripe.customers.list({
        email: emailLimpo,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        console.log("✅ [CHECKOUT] Cliente existente encontrado:", stripeCustomerId);
      } else {
        console.log("👤 [CHECKOUT] Novo cliente será criado no checkout");
      }
    } catch (customerError) {
      console.error("⚠️ [CHECKOUT] Erro ao verificar cliente:", customerError);
      // Continuar sem erro fatal
    }

    // Configurar URLs de sucesso e cancelamento
    const baseUrl = origin || "https://sisjusgestao.com.br";
    const successUrl = `${baseUrl}/pagamento?success=true`;
    const cancelUrl = `${baseUrl}/pagamento?canceled=true`;
    
    console.log("🔗 [CHECKOUT] URLs configuradas:");
    console.log("✅ Success:", successUrl);
    console.log("❌ Cancel:", cancelUrl);

    // Determinar Price ID baseado no ambiente
    const priceId = isProduction 
      ? 'price_1RfoO5Kr3xy0fCEP5COgihuw' // Produção
      : 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6'; // Teste
    
    console.log("💰 [CHECKOUT] Price ID selecionado:", priceId, `(${isProduction ? 'PRODUÇÃO' : 'TESTE'})`);

    // Configuração da sessão de checkout com 7 dias de teste
    const sessionConfig = {
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : emailLimpo,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription" as const,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          email_cliente: emailLimpo,
          plano: nomePlano || 'JusGestão Premium',
          valor: '3700',
          user_id: user?.id || 'novo_usuario',
          client_reference_id: clientReferenceId || emailLimpo,
          trial_days: '7',
          environment: isProduction ? 'production' : 'test'
        }
      },
      metadata: {
        email_cliente: emailLimpo,
        plano: nomePlano || 'JusGestão Premium',
        valor: '3700',
        user_id: user?.id || 'novo_usuario',
        client_reference_id: clientReferenceId || emailLimpo,
        trial_days: '7',
        environment: isProduction ? 'production' : 'test'
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      payment_method_collection: 'always',
      automatic_tax: {
        enabled: false
      }
    };

    console.log("⚙️ [CHECKOUT] Configuração da sessão:");
    console.log(JSON.stringify(sessionConfig, null, 2));

    // Criar sessão de checkout
    console.log("🔄 [CHECKOUT] Criando sessão no Stripe...");
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
      console.log("✅ [CHECKOUT] Sessão criada com sucesso!");
      console.log("🆔 [CHECKOUT] Session ID:", session.id);
      console.log("🔗 [CHECKOUT] Session URL:", session.url);
    } catch (stripeError) {
      console.error("❌ [CHECKOUT] Erro do Stripe ao criar sessão:", stripeError);
      
      let errorMessage = "Erro ao processar pagamento";
      if (stripeError instanceof Error) {
        if (stripeError.message.includes('No such price')) {
          errorMessage = `Price ID não encontrado: ${priceId}. Verifique a configuração do Stripe.`;
        } else if (stripeError.message.includes('Invalid email')) {
          errorMessage = "Email fornecido é inválido";
        } else {
          errorMessage = `Erro do Stripe: ${stripeError.message}`;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: stripeError instanceof Error ? stripeError.message : String(stripeError)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Resposta de sucesso
    const response = {
      sessionId: session.id,
      url: session.url,
      success: true,
      ambiente: isProduction ? 'PRODUÇÃO' : 'TESTE',
      priceId: priceId,
      trialDays: 7,
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: "✅ Sessão criada com 7 dias de teste GRATUITO! Primeira cobrança apenas após o período de teste.",
      valor: 3700,
      email: emailLimpo
    };

    console.log("🎉 [CHECKOUT] Sucesso! Retornando resposta:", response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("💥 [CHECKOUT] ERRO FATAL:", error);
    console.error("💥 [CHECKOUT] Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = "Erro interno do servidor";
    let errorCode = "INTERNAL_ERROR";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorCode = "NETWORK_ERROR";
        errorMessage = "Erro de conexão com o Stripe";
      } else if (error.message.includes('JSON')) {
        errorCode = "DATA_ERROR";
        errorMessage = "Erro nos dados da requisição";
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        message: "Houve um erro ao processar sua solicitação. Nossa equipe foi notificada.",
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
