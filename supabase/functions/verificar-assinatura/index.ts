// supabase/functions/verificar-assinatura/index.ts
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    console.log("verificar-assinatura: Verificando usuário:", user.email);

    // Admin master tem acesso total e status especial
    if (user.email === "webercostag@gmail.com") {
      console.log("verificar-assinatura: Usuário Admin detectado.");
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso de Administrador concedido.",
          account_type: "admin", // Status específico para admin
          subscription_status: "admin", // Para consistência com user_metadata
          current_period_end: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // Usuários com special_access (Amigos)
    if (user.user_metadata?.special_access === true) {
      console.log("verificar-assinatura: Usuário com special_access (Amigo) detectado.");
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso de Cortesia (Amigo) concedido.",
          account_type: "amigo", // Status específico para amigo
          subscription_status: "amigo", // Para consistência com user_metadata
          current_period_end: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Lógica para usuários pagantes (Stripe)
    // O webhook-stripe deve atualizar user_metadata com subscription_status e current_period_end
    const stripeSubscriptionStatus = user.user_metadata?.subscription_status;
    const stripeCurrentPeriodEnd = user.user_metadata?.current_period_end;

    console.log("verificar-assinatura: Stripe status from metadata:", stripeSubscriptionStatus);

    if (stripeSubscriptionStatus === 'active' || stripeSubscriptionStatus === 'trialing') {
      console.log("verificar-assinatura: Assinatura Stripe ativa ou em trial.");
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

    console.log("verificar-assinatura: Nenhuma assinatura ativa ou acesso especial encontrado.");
    return new Response(
      JSON.stringify({
        subscribed: false,
        message: "Nenhuma assinatura ativa ou acesso especial encontrado.",
        account_type: "none",
        subscription_status: "inativa",
        current_period_end: null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('verificar-assinatura: Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})