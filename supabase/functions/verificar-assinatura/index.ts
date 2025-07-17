
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  // Reduzir logs em produção para otimização
  const isProduction = Deno.env.get("DENO_ENV") === "production";
  if (!isProduction) {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[VERIFICAR-ASSINATURA] ${step}${detailsStr}`);
  }
};

// Rate limiting simples - máximo 120 requests por minuto por usuário
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 120;

  const current = rateLimitMap.get(userId) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 1;
    current.resetTime = now + windowMs;
  } else {
    current.count++;
  }
  
  rateLimitMap.set(userId, current);
  return current.count <= maxRequests;
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
    
    // Rate limiting por usuário
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        account_type: 'rate_limited',
        error: "Rate limit exceeded. Try again later." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }
    
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

    // Verificar período de trial - primeiro verifica se há data customizada
    const userCreatedAt = new Date(user.created_at);
    const customExpirationDate = user.user_metadata?.trial_expiration_date;
    
    let trialEndDate;
    if (customExpirationDate) {
      // Usar data de expiração customizada (definida pelo admin)
      trialEndDate = new Date(customExpirationDate);
      logStep("Using custom trial expiration", { customExpirationDate });
    } else {
      // Usar padrão de 7 dias a partir da criação da conta
      trialEndDate = new Date(userCreatedAt);
      trialEndDate.setDate(trialEndDate.getDate() + 7);
    }
    
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
    const canceledAt = user.user_metadata?.canceled_at;
    
    let subscriptionEndDate = null;
    if (currentPeriodEnd) {
      try {
        if (currentPeriodEnd.toString().match(/^\d+$/)) {
          subscriptionEndDate = new Date(parseInt(currentPeriodEnd) * 1000);
        } else {
          subscriptionEndDate = new Date(currentPeriodEnd);
        }
      } catch (e) {
        logStep("Error parsing subscription end date", { currentPeriodEnd });
      }
    }

    // Verificar se assinatura está ativa
    if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
      logStep("Active subscription found");
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'premium',
        subscription_end: subscriptionEndDate?.toISOString(),
        trial_days_remaining: null,
        message: 'Assinatura Premium ativa'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar se assinatura foi cancelada mas ainda está no período pago
    if (subscriptionStatus === 'canceled' && subscriptionEndDate && new Date() < subscriptionEndDate) {
      logStep("Canceled subscription still in grace period", { 
        endDate: subscriptionEndDate.toISOString(),
        now: new Date().toISOString()
      });
      
      const daysRemaining = Math.ceil((subscriptionEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return new Response(JSON.stringify({
        subscribed: true,
        account_type: 'canceled_grace',
        subscription_end: subscriptionEndDate.toISOString(),
        trial_days_remaining: null,
        days_remaining: daysRemaining,
        message: `Assinatura cancelada. Acesso liberado até ${subscriptionEndDate.toLocaleDateString('pt-BR')} (${daysRemaining} dias restantes)`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Se assinatura foi cancelada E já expirou o período pago - BLOQUEAR TOTALMENTE
    if (subscriptionStatus === 'canceled' && subscriptionEndDate && new Date() >= subscriptionEndDate) {
      logStep("Canceled subscription expired - blocking access", { 
        endDate: subscriptionEndDate.toISOString(),
        now: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        subscribed: false,
        account_type: 'expired_canceled',
        subscription_end: subscriptionEndDate.toISOString(),
        trial_days_remaining: null,
        message: 'Sua assinatura foi cancelada e o período pago expirou. Reative sua assinatura para continuar.'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar se está em período de carência por falta de pagamento
    if (subscriptionStatus === 'past_due' || subscriptionStatus === 'incomplete') {
      const pastDueSince = user.user_metadata?.past_due_since;
      
      if (pastDueSince) {
        const pastDueDate = new Date(pastDueSince);
        const gracePeriodEnd = new Date(pastDueDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5); // 5 dias de carência
        
        if (new Date() < gracePeriodEnd) {
          // Ainda no período de carência
          const daysRemaining = Math.ceil((gracePeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          logStep("Subscription in grace period", { 
            pastDueSince,
            gracePeriodEnd: gracePeriodEnd.toISOString(),
            daysRemaining
          });
          
          return new Response(JSON.stringify({
            subscribed: true,
            account_type: 'grace_period',
            subscription_end: subscriptionEndDate?.toISOString(),
            trial_days_remaining: null,
            grace_days_remaining: daysRemaining,
            message: `Pagamento pendente. Sistema será bloqueado em ${daysRemaining} dias se não pagar.`
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Período de carência expirou - BLOQUEAR TOTALMENTE
          logStep("Grace period expired - blocking access", { 
            pastDueSince,
            gracePeriodEnd: gracePeriodEnd.toISOString()
          });
          
          return new Response(JSON.stringify({
            subscribed: false,
            account_type: 'grace_expired',
            subscription_end: subscriptionEndDate?.toISOString(),
            trial_days_remaining: null,
            message: 'Período de carência de 5 dias expirado. Reative sua assinatura para continuar.'
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } else {
        // past_due sem data definida - permitir com aviso
        logStep("Subscription payment pending");
        return new Response(JSON.stringify({
          subscribed: false,
          account_type: 'pending',
          subscription_end: subscriptionEndDate?.toISOString(),
          trial_days_remaining: null,
          message: 'Pagamento da assinatura pendente'
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
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
