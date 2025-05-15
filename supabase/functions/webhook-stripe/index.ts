
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configurar cabeçalhos CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para log
const log = (message: string, data?: any) => {
  const dataStr = data ? ` - ${JSON.stringify(data)}` : '';
  console.log(`[WEBHOOK-STRIPE] ${message}${dataStr}`);
};

serve(async (req) => {
  // Lidar com solicitações OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    log("Recebido webhook do Stripe");
    
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeWebhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET não está configurada");
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Obter a assinatura do webhook do header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Assinatura do webhook não encontrada no header");
    }
    
    // Obter o corpo da solicitação como texto
    const body = await req.text();
    
    // Verificar a assinatura do webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      log("Erro ao verificar assinatura do webhook", { error: errorMessage });
      return new Response(
        JSON.stringify({ error: `Assinatura do webhook inválida: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    log("Evento recebido", { type: event.type });
    
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object);
        break;
        
      case "invoice.payment_succeeded":
        await handleSuccessfulPayment(event.data.object);
        break;
        
      case "invoice.payment_failed":
        await handleFailedPayment(event.data.object);
        break;
        
      default:
        log("Evento não processado", { type: event.type });
        break;
    }
    
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log("Erro ao processar webhook", { error: errorMessage });
    
    return new Response(
      JSON.stringify({ error: `Erro no webhook: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Manipular alterações em assinaturas
async function handleSubscriptionChange(subscription: any) {
  log("Processando alteração de assinatura", { 
    subscriptionId: subscription.id, 
    status: subscription.status
  });
  
  const customerId = subscription.customer;
  const status = subscription.status;
  
  // Aqui você pode adicionar lógica para atualizar seu banco de dados
  // com informações da assinatura
}

// Manipular pagamentos bem-sucedidos
async function handleSuccessfulPayment(invoice: any) {
  log("Processando pagamento bem-sucedido", { invoiceId: invoice.id });
  
  // Aqui você pode adicionar lógica para registrar pagamentos bem-sucedidos
  // e atualizar o status do cliente no seu banco de dados
}

// Manipular falhas de pagamento
async function handleFailedPayment(invoice: any) {
  log("Processando falha de pagamento", { invoiceId: invoice.id });
  
  // Aqui você pode adicionar lógica para lidar com falhas de pagamento
  // como notificar o cliente, tentar novamente o pagamento, etc.
}
