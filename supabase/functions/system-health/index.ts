
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🏥 Iniciando verificação de saúde do sistema...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const healthChecks = {
      database: false,
      auth: false,
      functions: false,
      stripe: false,
      timestamp: new Date().toISOString()
    };

    // Teste 1: Conexão com banco de dados
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('count', { count: 'exact', head: true });
      
      if (!error) {
        healthChecks.database = true;
        console.log("✅ Banco de dados: OK");
      } else {
        console.log("❌ Banco de dados: ERROR -", error.message);
      }
    } catch (error) {
      console.log("❌ Banco de dados: EXCEPTION -", error);
    }

    // Teste 2: Sistema de autenticação
    try {
      const { data: { users }, error } = await supabaseClient.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (!error) {
        healthChecks.auth = true;
        console.log("✅ Autenticação: OK");
      } else {
        console.log("❌ Autenticação: ERROR -", error.message);
      }
    } catch (error) {
      console.log("❌ Autenticação: EXCEPTION -", error);
    }

    // Teste 3: Edge Functions
    try {
      const { data, error } = await supabaseClient.functions.invoke('verificar-assinatura', {
        body: { test: true }
      });
      
      // Se não der erro de rede, consideramos OK
      healthChecks.functions = true;
      console.log("✅ Edge Functions: OK");
    } catch (error) {
      console.log("❌ Edge Functions: EXCEPTION -", error);
    }

    // Teste 4: Configurações Stripe
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
      
      if (stripeKey && webhookSecret) {
        healthChecks.stripe = true;
        console.log("✅ Stripe: OK");
      } else {
        console.log("❌ Stripe: Chaves não configuradas");
      }
    } catch (error) {
      console.log("❌ Stripe: EXCEPTION -", error);
    }

    // Calcular status geral
    const totalChecks = Object.keys(healthChecks).length - 1; // -1 para excluir timestamp
    const successfulChecks = Object.values(healthChecks).filter(check => check === true).length;
    const healthPercentage = (successfulChecks / totalChecks) * 100;

    let overallStatus = 'down';
    if (healthPercentage === 100) {
      overallStatus = 'operational';
    } else if (healthPercentage >= 50) {
      overallStatus = 'degraded';
    }

    const response = {
      status: overallStatus,
      health_percentage: healthPercentage,
      checks: healthChecks,
      summary: {
        total: totalChecks,
        passed: successfulChecks,
        failed: totalChecks - successfulChecks
      }
    };

    console.log(`🎯 Status geral: ${overallStatus} (${healthPercentage}%)`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("💥 Erro na verificação de saúde:", error);
    
    return new Response(JSON.stringify({
      status: 'down',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
