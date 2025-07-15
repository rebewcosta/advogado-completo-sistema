
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

    // Verificar chaves de ambiente
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey) {
      console.error("❌ [CHECKOUT] STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Chave do Stripe não configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ [CHECKOUT] Configurações do Supabase não encontradas");
      return new Response(
        JSON.stringify({ error: "Configuração do banco não encontrada" }),
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
        JSON.stringify({ error: "Dados da requisição inválidos" }),
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
      console.error("❌ [CHECKOUT] Email inválido:", emailCliente);
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
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

    // Determinar ambiente
    const origin = req.headers.get("origin") || dominio || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('lovableproject.com') &&
                        !origin.includes('127.0.0.1');
    
    console.log("🏷️ [CHECKOUT] Ambiente detectado:", isProduction ? "PRODUÇÃO" : "TESTE");

    // Inicializar Stripe
    console.log("💳 [CHECKOUT] Inicializando Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

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

    // Verificar/criar cliente no Stripe
    let customer = null;
    try {
      console.log("👤 [CHECKOUT] Verificando cliente existente no Stripe...");
      const existingCustomers = await stripe.customers.list({
        email: emailLimpo,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log("✅ [CHECKOUT] Cliente existente encontrado:", customer.id);
      } else {
        console.log("👤 [CHECKOUT] Criando novo cliente...");
        customer = await stripe.customers.create({
          email: emailLimpo,
          metadata: {
            user_id: user?.id || 'novo_usuario',
            client_reference_id: clientReferenceId || emailLimpo,
            environment: isProduction ? 'production' : 'test'
          }
        });
        console.log("✅ [CHECKOUT] Novo cliente criado:", customer.id);
      }
    } catch (customerError) {
      console.error("❌ [CHECKOUT] Erro ao gerenciar cliente:", customerError);
      return new Response(
        JSON.stringify({ error: "Erro ao processar dados do cliente" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Configuração da sessão de checkout com 7 dias de teste
    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ["card"],
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
          user_id: user?.id || 'novo_usuario',
          client_reference_id: clientReferenceId || emailLimpo,
          trial_days: '7',
          environment: isProduction ? 'production' : 'test'
        }
      },
      metadata: {
        email_cliente: emailLimpo,
        plano: nomePlano || 'JusGestão Premium',
        user_id: user?.id || 'novo_usuario',
        client_reference_id: clientReferenceId || emailLimpo,
        trial_days: '7',
        environment: isProduction ? 'production' : 'test'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    };

    console.log("⚙️ [CHECKOUT] Configuração da sessão preparada");

    // Criar sessão de checkout
    console.log("🔄 [CHECKOUT] Criando sessão no Stripe...");
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionConfig);
      console.log("✅ [CHECKOUT] Sessão criada com sucesso!");
      console.log("🆔 [CHECKOUT] Session ID:", session.id);
      console.log("🔗 [CHECKOUT] Session URL:", session.url);
    } catch (stripeError) {
      console.error("❌ [CHECKOUT] Erro do Stripe:", stripeError);
      
      let errorMessage = "Erro ao processar pagamento";
      if (stripeError instanceof Error) {
        if (stripeError.message.includes('No such price')) {
          errorMessage = `Price ID não encontrado: ${priceId}`;
        } else if (stripeError.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        } else {
          errorMessage = `Erro: ${stripeError.message}`;
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
      message: "✅ Sessão criada com 7 dias de teste GRATUITO!",
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
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        message: "Houve um erro ao processar sua solicitação"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
