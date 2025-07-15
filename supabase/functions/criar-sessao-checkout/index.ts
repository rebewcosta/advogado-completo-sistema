
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🚀 [CHECKOUT] Função iniciada");

  try {
    // Verificar método
    if (req.method !== "POST") {
      console.error("❌ [CHECKOUT] Método inválido:", req.method);
      return new Response(
        JSON.stringify({ error: "Método não permitido" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 405 
        }
      );
    }

    // Verificar variáveis de ambiente
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey) {
      console.error("❌ [CHECKOUT] Variáveis de ambiente faltando");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("✅ [CHECKOUT] Variáveis de ambiente OK");

    // Ler dados da requisição
    let requestData;
    try {
      const bodyText = await req.text();
      console.log("📝 [CHECKOUT] Body recebido:", bodyText);
      
      if (!bodyText.trim()) {
        throw new Error("Body vazio");
      }
      
      requestData = JSON.parse(bodyText);
      console.log("📋 [CHECKOUT] Dados parseados:", requestData);
    } catch (parseError) {
      console.error("❌ [CHECKOUT] Erro ao parsear JSON:", parseError);
      return new Response(
        JSON.stringify({ error: "Dados inválidos na requisição" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validar dados obrigatórios
    const { emailCliente, nomePlano, valor, dominio, clientReferenceId } = requestData;
    
    if (!emailCliente || typeof emailCliente !== 'string') {
      console.error("❌ [CHECKOUT] Email inválido:", emailCliente);
      return new Response(
        JSON.stringify({ error: "Email é obrigatório e deve ser uma string válida" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Validar formato do email
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

    // Determinar ambiente
    const origin = req.headers.get("origin") || dominio || "";
    const isProduction = !origin.includes('localhost') && 
                        !origin.includes('lovable.app') && 
                        !origin.includes('lovableproject.com') &&
                        !origin.includes('127.0.0.1');
    
    console.log("🏷️ [CHECKOUT] Ambiente:", isProduction ? "PRODUÇÃO" : "TESTE");

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    console.log("💳 [CHECKOUT] Stripe inicializado");

    // Determinar Price ID
    const priceId = isProduction 
      ? 'price_1RfoO5Kr3xy0fCEP5COgihuw' // Produção
      : 'price_1QQKh6FJ3Y1S0P0BSZVwNKa6'; // Teste
    
    console.log("💰 [CHECKOUT] Price ID:", priceId);

    // Configurar URLs
    const baseUrl = origin || "https://sisjusgestao.com.br";
    const successUrl = `${baseUrl}/pagamento?success=true`;
    const cancelUrl = `${baseUrl}/pagamento?canceled=true`;
    
    console.log("🔗 [CHECKOUT] URLs:", { successUrl, cancelUrl });

    // Verificar/criar cliente
    let customer = null;
    try {
      console.log("👤 [CHECKOUT] Verificando cliente no Stripe...");
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

    // Criar sessão de checkout
    try {
      console.log("🔄 [CHECKOUT] Criando sessão...");
      
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
            client_reference_id: clientReferenceId || emailLimpo,
            trial_days: '7',
            environment: isProduction ? 'production' : 'test'
          }
        },
        metadata: {
          email_cliente: emailLimpo,
          plano: nomePlano || 'JusGestão Premium',
          client_reference_id: clientReferenceId || emailLimpo,
          trial_days: '7',
          environment: isProduction ? 'production' : 'test'
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto'
      };

      console.log("⚙️ [CHECKOUT] Configuração da sessão preparada");

      const session = await stripe.checkout.sessions.create(sessionConfig);
      
      console.log("✅ [CHECKOUT] Sessão criada com sucesso!");
      console.log("🆔 [CHECKOUT] Session ID:", session.id);
      console.log("🔗 [CHECKOUT] Session URL:", session.url);

      if (!session.url) {
        throw new Error("URL da sessão não foi gerada");
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

    } catch (stripeError) {
      console.error("❌ [CHECKOUT] Erro do Stripe:", stripeError);
      
      let errorMessage = "Erro ao processar pagamento";
      if (stripeError instanceof Error) {
        errorMessage = stripeError.message;
        console.error("❌ [CHECKOUT] Detalhes do erro:", stripeError.message);
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: "Erro na criação da sessão de checkout"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

  } catch (error) {
    console.error("💥 [CHECKOUT] ERRO FATAL:", error);
    console.error("💥 [CHECKOUT] Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor",
        message: "Houve um erro inesperado ao processar sua solicitação"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
