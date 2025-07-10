
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
      requestData = {};
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
    const { nomePlano, valor, emailCliente, dominio } = requestData;
    
    // Detectar ambiente baseado no dominio ou headers
    const isProduction = !dominio?.includes('localhost') && 
                        !dominio?.includes('lovable.app') && 
                        !req.headers.get("origin")?.includes('localhost') &&
                        !req.headers.get("origin")?.includes('lovableproject.com');
    
    const modo = isProduction ? 'production' : 'test';
    
    // Validar os dados necessários
    if (!nomePlano || !valor || !emailCliente) {
      console.error("❌ Dados incompletos:", { nomePlano, valor, emailCliente });
      return new Response(
        JSON.stringify({ error: "Dados incompletos para criar sessão" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Log do modo de operação
    console.log(`🔄 Processando checkout - Email: ${emailCliente}, Plano: ${nomePlano}, Valor: ${valor}, Modo: ${modo}`);

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
    const baseUrl = dominio || req.headers.get("origin") || "https://sisjusgestao.com.br";
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
    
    // Criar a sessão de checkout usando o Price ID configurado
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: emailCliente,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        email_cliente: emailCliente,
        plano: nomePlano,
        valor: valorCorreto.toString(),
        user_id: user?.id || 'novo_usuario',
        is_new_user: user ? 'false' : 'true'
      },
    });

    console.log(`✅ Sessão criada com sucesso: ${session.id}`);

    // Retornar o ID da sessão e URL
    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url,
        modo: modo,
        valor: valorCorreto,
        priceId: priceId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("❌ Erro ao criar sessão de checkout:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: "Houve um erro ao processar o pagamento"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
