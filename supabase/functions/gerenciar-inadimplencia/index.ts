
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
    console.log("🔄 Executando verificação de inadimplência...");

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

    // Buscar assinaturas com status past_due há mais de 5 dias
    const fiveDaysAgo = Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60);
    
    const subscriptions = await stripe.subscriptions.list({
      status: 'past_due',
      limit: 100,
    });

    let canceledCount = 0;

    for (const subscription of subscriptions.data) {
      // Verificar se a última tentativa de pagamento foi há mais de 5 dias
      const lastInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      
      if (lastInvoice.status_transitions?.finalized_at && 
          lastInvoice.status_transitions.finalized_at < fiveDaysAgo) {
        
        console.log(`❌ Cancelando assinatura ${subscription.id} por inadimplência > 5 dias`);
        
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
                  cancellation_reason: 'automatic_nonpayment_5_days'
                }
              }
            );
            
            console.log(`✅ Usuário ${customer.email} marcado como cancelado`);
          }
        }
        
        canceledCount++;
      }
    }

    console.log(`🎯 Processamento concluído: ${canceledCount} assinaturas canceladas`);

    return new Response(JSON.stringify({
      success: true,
      canceled_subscriptions: canceledCount,
      message: `${canceledCount} assinaturas canceladas por inadimplência > 5 dias`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro no gerenciamento de inadimplência:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
