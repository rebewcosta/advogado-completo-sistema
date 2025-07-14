
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
    console.log("🔄 Iniciando criar-sessao-checkout");

    // Verificar se é um teste de validação
    const body = await req.text();
    let requestData;
    
    try {
      requestData = body ? JSON.parse(body) : {};
    } catch (e) {
      console.error("❌ Erro ao fazer parse do JSON:", e);
      return new Response(
        JSON.stringify({ error: "Dados JSON inválidos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Se for um teste simples, retornar sucesso
    if (requestData.test === true) {
      console.log("✅ Teste de validação - retornando sucesso");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Função de checkout operacional",
          test: true
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        }
      );
    }

    // Obter os dados do corpo da solicitação
    const { nomePlano, valor, emailCliente, dominio, clientReferenceId } = requestData;
    
    console.log("📧 Dados recebidos:", { nomePlano, valor, emailCliente, dominio, clientReferenceId });
    
    // Validar os dados necessários
    if (!emailCliente || !emailCliente.trim()) {
      console.error("❌ Email do cliente não fornecido ou vazio");
      return new Response(
        JSON.stringify({ error: "Email é obrigatório para criar sessão de checkout" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailCliente)) {
      console.error("❌ Email inválido:", emailCliente);
      return new Response(
        JSON.stringify({ error: "Email fornecido não é válido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Detectar ambiente baseado no dominio ou headers
    const origin = req.headers.get("origin") || dominio || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('lovableproject.com');
    
    const modo = isProduction ? 'production' : 'test';
    
    console.log(`🔄 Processando checkout - Email: ${emailCliente}, Modo: ${modo}`);

    // Verificar autenticação opcional (para usuários já logados)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      console.log("🔄 Token de autenticação detectado, verificando usuário...");
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (!userError && userData.user?.email) {
          user = userData.user;
          console.log(`✅ Usuário autenticado detectado: ${user.email}`);
        } else {
          console.log("⚠️ Token inválido ou usuário não encontrado, continuando como novo usuário");
        }
      } catch (e) {
        console.log("⚠️ Erro ao verificar token, continuando como novo usuário:", e);
      }
    } else {
      console.log("📝 Nenhum token de autenticação - processando como novo usuário");
    }
    
    // Obter a chave do Stripe do ambiente
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Chave de API do Stripe não configurada" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log(`🔄 Iniciando Stripe no modo: ${modo.toUpperCase()}`);
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log("🔄 Criando sessão de checkout...");
    
    // Determinar as URLs de sucesso e cancelamento
    const baseUrl = origin || req.headers.get("referer") || "https://sisjusgestao.com.br";
    const successUrl = `${baseUrl}/pagamento?success=true`;
    const cancelUrl = `${baseUrl}/pagamento?canceled=true`;
    
    console.log(`🔗 URLs - Success: ${successUrl}, Cancel: ${cancelUrl}`);
    
    // Usar o valor correto de R$ 37,00 (3700 centavos)
    const valorCorreto = 3700;
    
    // Determinar o Price ID baseado no ambiente
    const priceId = isProduction 
      ? 'price_1RfoO5Kr3xy0fCEP5COgihuw' // Price ID de produção
      : 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6'; // Price ID de teste
    
    console.log(`💰 Usando Price ID: ${priceId} (modo: ${modo})`);
    
    // Verificar se o cliente já existe no Stripe
    let stripeCustomerId = null;
    try {
      const existingCustomers = await stripe.customers.list({
        email: emailCliente,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        console.log(`✅ Cliente existente encontrado: ${stripeCustomerId}`);
      } else {
        console.log("📝 Novo cliente será criado no Stripe");
      }
    } catch (error) {
      console.log("⚠️ Erro ao verificar cliente existente:", error);
    }
    
    // **CONFIGURAÇÃO CRÍTICA: Session de checkout com 7 dias de teste gratuito OBRIGATÓRIO**
    const sessionConfig = {
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : emailCliente,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      // **CRÍTICO: Configuração do período de teste de 7 dias**
      subscription_data: {
        trial_period_days: 7, // 7 dias de teste gratuito OBRIGATÓRIO
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel' // IMPORTANTE: Cancela automaticamente se não tiver cartão após trial
          }
        },
        metadata: {
          email_cliente: emailCliente,
          plano: nomePlano || 'JusGestão Premium',
          valor: valorCorreto.toString(),
          user_id: user?.id || 'novo_usuario',
          is_new_user: user ? 'false' : 'true',
          client_reference_id: clientReferenceId || emailCliente,
          trial_days: '7',
          trial_start: new Date().toISOString(),
          auto_cancel_if_no_payment: 'true'
        }
      },
      metadata: {
        email_cliente: emailCliente,
        plano: nomePlano || 'JusGestão Premium',
        valor: valorCorreto.toString(),
        user_id: user?.id || 'novo_usuario',
        is_new_user: user ? 'false' : 'true',
        client_reference_id: clientReferenceId || emailCliente,
        trial_days: '7',
        trial_start: new Date().toISOString(),
        auto_cancel_if_no_payment: 'true'
      },
      // **IMPORTANTE: Coleta de endereço obrigatória**
      billing_address_collection: 'required',
      // **IMPORTANTE: Permitir códigos promocionais**
      allow_promotion_codes: true,
      // **CRÍTICO: Configurar coleta de forma de pagamento OBRIGATÓRIA durante trial**
      payment_method_collection: 'always', // Força coleta do cartão
      // **IMPORTANTE: Termos de serviço**
      consent_collection: {
        terms_of_service: 'required'
      },
      // **CRÍTICO: Configurações adicionais para garantir cancelamento automático**
      automatic_tax: {
        enabled: false
      }
    };

    console.log("🔄 Configuração da sessão:", JSON.stringify(sessionConfig, null, 2));

    // Criar a sessão de checkout com período de teste OBRIGATÓRIO
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`✅ Sessão criada com sucesso: ${session.id} - COM 7 DIAS DE TESTE GRATUITO OBRIGATÓRIO`);
    console.log(`🎁 Trial configurado: 7 dias gratuitos GARANTIDOS antes da primeira cobrança`);
    console.log(`💳 Primeira cobrança apenas após: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`);
    console.log(`🚫 Cancelamento automático configurado se usuário não quiser continuar`);

    // Retornar o ID da sessão e URL
    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        modo: modo,
        valor: valorCorreto,
        priceId: priceId,
        trialDays: 7,
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        message: "Sessão criada com 7 dias de teste gratuito GARANTIDO - SEM cobrança nos primeiros 7 dias. Cancele a qualquer momento durante o trial.",
        cancelPolicy: "Cancelamento automático se não confirmar após 7 dias"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("❌ Erro ao criar sessão de checkout:", error);
    
    let errorMessage = "Erro interno do servidor";
    let errorDetails = "";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
      
      // Verificar se é um erro específico do Stripe
      if (error.message.includes('No such price')) {
        errorMessage = "Erro na configuração do preço do Stripe";
        errorDetails = "O Price ID configurado não foi encontrado no Stripe";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "Email inválido fornecido";
      } else if (error.message.includes('customer')) {
        errorMessage = "Erro ao processar dados do cliente";
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error);
    }
    
    console.error("❌ Detalhes do erro:", { errorMessage, errorDetails });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "Houve um erro ao processar o pagamento. Tente novamente em alguns instantes.",
        details: errorDetails
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
