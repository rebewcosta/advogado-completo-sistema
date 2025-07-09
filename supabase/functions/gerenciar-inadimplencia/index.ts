
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [INADIMPLENCIA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let canceledCount = 0;
  let processedSubscriptions = 0;
  let errors: string[] = [];

  try {
    logStep("🔄 Iniciando verificação de inadimplência automática");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Data limite: 5 dias atrás
    const fiveDaysAgo = Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60);
    logStep("📅 Data limite para cancelamento", { fiveDaysAgo, date: new Date(fiveDaysAgo * 1000).toISOString() });
    
    // Buscar assinaturas com status past_due
    const subscriptions = await stripe.subscriptions.list({
      status: 'past_due',
      limit: 100,
    });

    logStep(`📋 Assinaturas past_due encontradas: ${subscriptions.data.length}`);

    for (const subscription of subscriptions.data) {
      processedSubscriptions++;
      
      try {
        // Verificar se a última tentativa de pagamento foi há mais de 5 dias
        const lastInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
        
        if (lastInvoice.status_transitions?.finalized_at && 
            lastInvoice.status_transitions.finalized_at < fiveDaysAgo) {
          
          logStep(`❌ Cancelando assinatura por inadimplência > 5 dias`, {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            daysOverdue: Math.floor((Date.now() / 1000 - lastInvoice.status_transitions.finalized_at) / (24 * 60 * 60))
          });
          
          // Cancelar assinatura no Stripe
          await stripe.subscriptions.cancel(subscription.id, {
            cancellation_details: {
              comment: "Cancelamento automático por inadimplência superior a 5 dias"
            }
          });

          // Buscar cliente e atualizar status no Supabase
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          
          if (customer.email) {
            const { data: user } = await supabase.auth.admin.getUserByEmail(customer.email);
            
            if (user) {
              await supabase.auth.admin.updateUserById(
                user.id,
                {
                  user_metadata: {
                    ...user.user_metadata,
                    subscription_status: 'canceled',
                    canceled_at: new Date().toISOString(),
                    cancellation_reason: 'automatic_nonpayment_5_days',
                    past_due_since: null,
                    payment_failed_at: null
                  }
                }
              );
              
              logStep(`✅ Usuário marcado como cancelado`, { email: customer.email, userId: user.id });
            } else {
              logStep(`⚠️ Usuário não encontrado no Supabase`, { email: customer.email });
            }
          } else {
            logStep(`⚠️ Email do cliente não encontrado`, { customerId: customer.id });
          }
          
          canceledCount++;
        } else {
          logStep(`ℹ️ Assinatura ainda dentro do prazo de 5 dias`, {
            subscriptionId: subscription.id,
            lastAttempt: lastInvoice.status_transitions?.finalized_at
          });
        }
      } catch (subscriptionError) {
        const errorMsg = `Erro ao processar assinatura ${subscription.id}: ${subscriptionError.message}`;
        logStep(`❌ Erro individual`, { subscriptionId: subscription.id, error: errorMsg });
        errors.push(errorMsg);
      }
    }

    const executionTime = Date.now() - startTime;
    const result = {
      success: true,
      canceled_subscriptions: canceledCount,
      processed_subscriptions: processedSubscriptions,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString(),
      message: `Processamento concluído: ${canceledCount} assinaturas canceladas de ${processedSubscriptions} processadas`,
      errors: errors.length > 0 ? errors : undefined
    };

    // Salvar log no banco
    try {
      await supabase.from('cancelamento_logs').insert({
        canceled_count: canceledCount,
        details: {
          processed_subscriptions: processedSubscriptions,
          execution_time_ms: executionTime,
          errors: errors
        },
        success: errors.length === 0,
        error_message: errors.length > 0 ? errors.join('; ') : null
      });
    } catch (logError) {
      logStep(`⚠️ Erro ao salvar log`, { error: logError.message });
    }

    logStep(`🎯 Processamento concluído`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorResult = {
      success: false,
      error: error.message,
      canceled_subscriptions: canceledCount,
      processed_subscriptions: processedSubscriptions,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString()
    };

    logStep(`❌ Erro crítico no gerenciamento de inadimplência`, errorResult);
    
    // Tentar salvar log de erro
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      await supabase.from('cancelamento_logs').insert({
        canceled_count: canceledCount,
        details: errorResult,
        success: false,
        error_message: error.message
      });
    } catch (logError) {
      logStep(`⚠️ Erro ao salvar log de erro`, { error: logError.message });
    }
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
