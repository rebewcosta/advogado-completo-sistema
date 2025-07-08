
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFICAR-ASSINATURA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Authentication error: ${userError?.message}`);
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verificar se é admin ou conta especial
    if (user.email === 'webercostag@gmail.com') {
      logStep("Admin user detected");
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'admin',
        subscription_end: null,
        trial_days_remaining: null,
        message: 'Acesso total de Administrador'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (user.user_metadata?.special_access === true) {
      logStep("Special access user detected");
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'amigo',
        subscription_end: null,
        trial_days_remaining: null,
        message: 'Acesso de cortesia vitalício (Assinatura Amiga)'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar período de trial (7 dias a partir da criação da conta)
    const userCreatedAt = new Date(user.created_at);
    const trialEndDate = new Date(userCreatedAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const now = new Date();
    
    const isInTrial = now < trialEndDate;
    const trialDaysRemaining = isInTrial ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    logStep("Trial check", { 
      userCreatedAt: userCreatedAt.toISOString(), 
      trialEndDate: trialEndDate.toISOString(),
      isInTrial,
      trialDaysRemaining 
    });

    // Se ainda está no período de trial
    if (isInTrial) {
      logStep("User is in trial period", { daysRemaining: trialDaysRemaining });
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'trial',
        subscription_end: trialEndDate.toISOString(),
        trial_days_remaining: trialDaysRemaining,
        message: `Período de teste gratuito - ${trialDaysRemaining} dias restantes`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar assinatura Stripe nos metadados
    const subscriptionStatus = user.user_metadata?.subscription_status;
    const currentPeriodEnd = user.user_metadata?.current_period_end;
    
    let subscriptionEndDate = null;
    if (currentPeriodEnd) {
      try {
        if (currentPeriodEnd.toString().match(/^\d+$/)) {
          subscriptionEndDate = new Date(parseInt(currentPeriodEnd) * 1000).toISOString();
        } else {
          subscriptionEndDate = new Date(currentPeriodEnd).toISOString();
        }
      } catch (e) {
        logStep("Error parsing subscription end date", { currentPeriodEnd });
      }
    }

    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
      logStep("Active subscription found");
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'premium',
        subscription_end: subscriptionEndDate,
        trial_days_remaining: null,
        message: 'Assinatura Premium ativa'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (subscriptionStatus === 'past_due' || subscriptionStatus === 'incomplete') {
      logStep("Subscription payment pending");
      return new Response(JSON.stringify({
        subscribed: false,
        account_type: 'pending',
        subscription_end: subscriptionEndDate,
        trial_days_remaining: null,
        message: 'Pagamento da assinatura pendente'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Trial expirado e sem assinatura ativa
    logStep("Trial expired, no active subscription");
    return new Response(JSON.stringify({
      subscribed: false,
      account_type: 'none',
      subscription_end: null,
      trial_days_remaining: 0,
      message: 'Período de teste expirado. Assine para continuar usando o sistema.'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verificar-assinatura", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      subscribed: false,
      account_type: 'error',
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
