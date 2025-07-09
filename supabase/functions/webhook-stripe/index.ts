
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { handleSubscriptionEvent, handleInvoiceEvent } from "./webhook-handlers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [WEBHOOK-MAIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    logStep("🔄 Webhook Stripe recebido", { 
      method: req.method,
      url: req.url
    });

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !webhookSecret) {
      logStep("❌ Configurações do Stripe não encontradas");
      return new Response("Configuração inválida", { 
        status: 500,
        headers: corsHeaders
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Verificar assinatura do webhook
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("❌ Assinatura do webhook não encontrada");
      return new Response("Assinatura inválida", { 
        status: 400,
        headers: corsHeaders
      });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep(`✅ Evento válido recebido`, { 
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString()
      });
    } catch (err) {
      logStep("❌ Erro ao verificar webhook", { error: err.message });
      return new Response("Webhook inválido", { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Criar cliente Supabase com service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Processar eventos do Stripe
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await handleSubscriptionEvent(event, supabase, stripe);
          break;
        
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
          await handleInvoiceEvent(event, supabase, stripe);
          break;
          
        default:
          logStep(`ℹ️ Evento não processado`, { type: event.type });
      }

      const executionTime = Date.now() - startTime;
      logStep(`✅ Webhook processado com sucesso`, { 
        eventType: event.type,
        executionTime: `${executionTime}ms`
      });

      return new Response("OK", { 
        status: 200,
        headers: corsHeaders
      });

    } catch (processingError) {
      const executionTime = Date.now() - startTime;
      logStep("❌ Erro ao processar evento", { 
        eventType: event.type,
        error: processingError.message,
        executionTime: `${executionTime}ms`
      });
      
      return new Response("Erro no processamento", { 
        status: 500,
        headers: corsHeaders
      });
    }

  } catch (error) {
    const executionTime = Date.now() - startTime;
    logStep("❌ Erro crítico no webhook", { 
      error: error.message,
      executionTime: `${executionTime}ms`
    });
    
    return new Response("Erro interno", { 
      status: 500,
      headers: corsHeaders
    });
  }
});
