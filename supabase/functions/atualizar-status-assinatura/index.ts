import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ATUALIZAR-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    
    // Verificar se é uma ação de admin
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      requestBody = {};
    }

    let targetUser;
    
    if (requestBody.admin_action && requestBody.email_to_fix) {
      // Ação de admin - usar service role para buscar usuário específico
      logStep("Admin action - looking up user", { email: requestBody.email_to_fix });
      
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: users, error: usersError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email')
        .eq('email', requestBody.email_to_fix)
        .limit(1);
      
      if (usersError || !users || users.length === 0) {
        throw new Error(`User not found: ${requestBody.email_to_fix}`);
      }
      
      targetUser = {
        id: users[0].id,
        email: users[0].email,
        user_metadata: {} // Will be updated later
      };

    } else {
      // Usuário normal - autenticar via token
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

      targetUser = userData.user;
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("User authenticated", { userId: targetUser.id, email: targetUser.email });

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({ 
      email: targetUser.email, 
      limit: 1 
    });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found - updating as inactive");
      
      // Atualizar usuário como inativo
      await supabase.auth.admin.updateUserById(targetUser.id, {
        user_metadata: {
          ...targetUser.user_metadata,
          subscription_status: 'inactive',
          stripe_customer_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString()
        }
      });

      return new Response(JSON.stringify({
        success: true,
        status: 'inactive',
        message: 'Usuário não possui cliente no Stripe - status atualizado para inativo'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Stripe customer found", { customerId });

    // Buscar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10
    });

    logStep("Subscriptions found", { 
      count: subscriptions.data.length,
      subscriptions: subscriptions.data.map(s => ({
        id: s.id,
        status: s.status,
        current_period_end: s.current_period_end
      }))
    });

    // Encontrar a assinatura mais recente
    const activeSubscription = subscriptions.data.find(s => 
      ['active', 'trialing', 'past_due'].includes(s.status)
    );

    const latestSubscription = subscriptions.data[0]; // Mais recente

    let updateData = {
      ...targetUser.user_metadata,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString()
    };

    if (activeSubscription) {
      logStep("Active subscription found", { 
        id: activeSubscription.id, 
        status: activeSubscription.status 
      });

      updateData = {
        ...updateData,
        subscription_status: activeSubscription.status,
        subscription_id: activeSubscription.id,
        current_period_end: activeSubscription.current_period_end,
      };

      // Limpar flags de problema se ativa
      if (activeSubscription.status === 'active') {
        updateData.past_due_since = null;
        updateData.payment_failed_at = null;
        updateData.payment_recovered_at = new Date().toISOString();
      }

    } else if (latestSubscription) {
      logStep("No active subscription, using latest", { 
        id: latestSubscription.id, 
        status: latestSubscription.status 
      });

      updateData = {
        ...updateData,
        subscription_status: latestSubscription.status,
        subscription_id: latestSubscription.id,
        current_period_end: latestSubscription.current_period_end,
      };

      if (latestSubscription.status === 'canceled') {
        updateData.canceled_at = new Date().toISOString();
      }

    } else {
      logStep("No subscriptions found");
      updateData.subscription_status = 'inactive';
    }

    // Atualizar usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: updateData
    });

    if (updateError) {
      logStep("Error updating user", { error: updateError.message });
      throw updateError;
    }

    logStep("User updated successfully", { 
      userId: targetUser.id,
      status: updateData.subscription_status
    });

    return new Response(JSON.stringify({
      success: true,
      status: updateData.subscription_status,
      subscription_id: updateData.subscription_id,
      current_period_end: updateData.current_period_end,
      message: 'Status da assinatura atualizado com sucesso'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});