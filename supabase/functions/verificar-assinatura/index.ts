
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the token from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    // Verify the token and get the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    console.log("User email in verificar-assinatura:", user.email)
    
    // Special handling for specific emails
    const specialEmails = [
      "webercostag@gmail.com",
      "teste@sisjusgestao.com.br",
      "logo.advocacia@gmail.com",
      "future.iartificial@gmail.com" // <-- NOVO EMAIL ADICIONADO AQUI
    ]
    
    // Exact match check for webercostag@gmail.com with detailed logging
    if (user.email === "webercostag@gmail.com") {
      console.log("Email exato webercostag@gmail.com detectado na função! Retornando subscribed: true")
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso especial concedido para conta de teste",
          account_type: "special"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // Check if email is in special list or has special_access in metadata
    if (specialEmails.includes(user.email || '') || user.user_metadata?.special_access === true) {
      console.log("Special access detected for", user.email)
      return new Response(
        JSON.stringify({
          subscribed: true,
          message: "Acesso especial concedido",
          account_type: "special"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Here you would normally check Stripe subscription status
    // For now, we'll simulate this with a hardcoded response
    
    // Placeholder - in production, check Stripe subscriptions collection
    const hasActiveSubscription = false

    return new Response(
      JSON.stringify({
        subscribed: hasActiveSubscription,
        message: hasActiveSubscription 
          ? "Assinatura ativa encontrada" 
          : "Nenhuma assinatura ativa encontrada"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
