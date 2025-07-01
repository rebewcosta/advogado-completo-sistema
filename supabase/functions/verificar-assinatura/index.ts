
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🔄 Verificando assinatura do usuário...");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("❌ Authorization header não encontrado");
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error("❌ Erro ao obter usuário:", userError?.message || 'User not found');
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    console.log("✅ Usuário autenticado:", user.email);

    // Admin master tem acesso total
    if (user.email === "webercostag@gmail.com") {
      console.log("👑 Usuário Admin detectado");
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso de Administrador concedido.",
          account_type: "admin",
          subscription_status: "admin",
          current_period_end: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // Usuários com acesso especial (Amigos)
    if (user.user_metadata?.special_access === true) {
      console.log("🎁 Usuário com acesso especial (Amigo) detectado");
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso de Cortesia (Amigo) concedido.",
          account_type: "amigo",
          subscription_status: "amigo",
          current_period_end: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Verificar assinatura Stripe nos metadados do usuário
    const stripeSubscriptionStatus = user.user_metadata?.subscription_status;
    const stripeCurrentPeriodEnd = user.user_metadata?.current_period_end;

    console.log("📊 Status Stripe dos metadados:", stripeSubscriptionStatus);

    if (stripeSubscriptionStatus === 'active' || stripeSubscriptionStatus === 'trialing') {
      console.log("✅ Assinatura Stripe ativa ou em trial");
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Assinatura Premium ativa.",
          account_type: "premium",
          subscription_status: stripeSubscriptionStatus,
          current_period_end: stripeCurrentPeriodEnd,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Verificar se está com pagamento em atraso mas ainda dentro do período de graça
    if (stripeSubscriptionStatus === 'past_due') {
      console.log("⚠️ Assinatura em atraso, mas ainda com acesso");
      return new Response(
        JSON.stringify({
          subscribed: true, // Ainda permite acesso
          message: "Pagamento em atraso. Regularize para manter o acesso.",
          account_type: "premium",
          subscription_status: "past_due",
          current_period_end: stripeCurrentPeriodEnd,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log("❌ Nenhuma assinatura ativa encontrada");
    return new Response(
      JSON.stringify({
        subscribed: false,
        message: "Nenhuma assinatura ativa encontrada.",
        account_type: "none",
        subscription_status: "inativa",
        current_period_end: null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro na verificação de assinatura:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
