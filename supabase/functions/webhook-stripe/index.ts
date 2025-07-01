
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Webhook Stripe recebido");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !webhookSecret) {
      console.error("❌ Configurações do Stripe não encontradas");
      return new Response("Configuração inválida", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verificar assinatura do webhook
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ Assinatura do webhook não encontrada");
      return new Response("Assinatura inválida", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Evento válido: ${event.type}`);
    } catch (err) {
      console.error("❌ Erro ao verificar webhook:", err);
      return new Response("Webhook inválido", { status: 400 });
    }

    // Criar cliente Supabase com service role para bypass de RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Processar eventos do Stripe
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event, supabase);
        break;
      
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        await handleInvoiceEvent(event, supabase);
        break;
        
      default:
        console.log(`ℹ️ Evento não processado: ${event.type}`);
    }

    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return new Response("Erro interno", { status: 500 });
  }
});

async function handleSubscriptionEvent(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  console.log(`🔄 Processando assinatura: ${subscription.id} - Status: ${subscription.status}`);

  try {
    // Buscar cliente no Stripe para obter email
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (!customer.email) {
      console.error("❌ Email do cliente não encontrado");
      return;
    }

    // Buscar usuário no Supabase pelo email
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail(customer.email);
    
    if (userError || !user) {
      console.error("❌ Usuário não encontrado:", customer.email);
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.id}`);

    // Preparar dados de atualização
    const subscriptionData = {
      subscription_status: subscription.status,
      stripe_customer_id: customerId,
      current_period_end: subscription.current_period_end,
      subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    };

    // Atualizar metadados do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          ...subscriptionData
        }
      }
    );

    if (updateError) {
      console.error("❌ Erro ao atualizar usuário:", updateError);
    } else {
      console.log("✅ Usuário atualizado com sucesso");
    }

    // Log da ação
    console.log(`📝 Assinatura ${subscription.status}: ${customer.email}`);

  } catch (error) {
    console.error("❌ Erro ao processar assinatura:", error);
  }
}

async function handleInvoiceEvent(event: Stripe.Event, supabase: any) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;

  console.log(`🧾 Processando fatura: ${invoice.id} - Status: ${invoice.status}`);

  try {
    // Buscar cliente no Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (!customer.email) {
      console.error("❌ Email do cliente não encontrado na fatura");
      return;
    }

    // Se pagamento falhou, marcar como past_due
    if (event.type === "invoice.payment_failed") {
      const { data: user } = await supabase.auth.admin.getUserByEmail(customer.email);
      
      if (user) {
        await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              subscription_status: 'past_due',
              payment_failed_at: new Date().toISOString()
            }
          }
        );
        console.log(`⚠️ Pagamento falhou para: ${customer.email}`);
      }
    }

    console.log(`✅ Fatura processada: ${customer.email}`);

  } catch (error) {
    console.error("❌ Erro ao processar fatura:", error);
  }
}
