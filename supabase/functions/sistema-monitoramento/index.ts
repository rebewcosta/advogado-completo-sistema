
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
  console.log(`[${timestamp}] [SISTEMA-MONITOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🔍 Iniciando monitoramento do sistema");

    // Verificar se é admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user || userData.user.email !== 'webercostag@gmail.com') {
      return new Response(JSON.stringify({ error: "Acesso negado - Admin only" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Coletar métricas do sistema
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Assinaturas ativas
    const activeSubscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    // 2. Assinaturas em atraso
    const pastDueSubscriptions = await stripe.subscriptions.list({
      status: 'past_due',
      limit: 100,
    });

    // 3. Faturas falhas nas últimas 24h
    const failedInvoices = await stripe.invoices.list({
      status: 'open',
      created: { gte: Math.floor(oneDayAgo.getTime() / 1000) },
      limit: 100,
    });

    // 4. Logs de cancelamento recentes
    const { data: cancelamentosRecentes, error: logsError } = await supabase
      .from('cancelamento_logs')
      .select('*')
      .gte('executed_at', oneWeekAgo.toISOString())
      .order('executed_at', { ascending: false })
      .limit(10);

    // 5. Usuários em trial prestes a expirar (próximos 2 dias)
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    
    let trialExpiringCount = 0;
    let totalTrialUsers = 0;

    if (allUsers?.users) {
      for (const user of allUsers.users) {
        const userCreatedAt = new Date(user.created_at);
        const trialEndDate = new Date(userCreatedAt);
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        const isInTrial = now < trialEndDate;
        if (isInTrial) {
          totalTrialUsers++;
          if (trialEndDate <= twoDaysFromNow) {
            trialExpiringCount++;
          }
        }
      }
    }

    // Identificar problemas críticos
    const problemas = [];
    if (pastDueSubscriptions.data.length > 5) {
      problemas.push(`⚠️ ${pastDueSubscriptions.data.length} assinaturas em atraso`);
    }
    if (failedInvoices.data.length > 3) {
      problemas.push(`❌ ${failedInvoices.data.length} faturas falhas nas últimas 24h`);
    }
    if (trialExpiringCount > 10) {
      problemas.push(`⏰ ${trialExpiringCount} trials expirando em 2 dias`);
    }

    const resultado = {
      timestamp: now.toISOString(),
      status: problemas.length === 0 ? 'healthy' : 'warning',
      metricas: {
        assinaturas_ativas: activeSubscriptions.data.length,
        assinaturas_em_atraso: pastDueSubscriptions.data.length,
        faturas_falhas_24h: failedInvoices.data.length,
        usuarios_trial_total: totalTrialUsers,
        usuarios_trial_expirando_2d: trialExpiringCount,
        receita_mensal_estimada: activeSubscriptions.data.length * 37
      },
      logs_cancelamento_recentes: cancelamentosRecentes || [],
      problemas_identificados: problemas,
      alertas: {
        criticos: problemas.filter(p => p.includes('❌')),
        avisos: problemas.filter(p => p.includes('⚠️') || p.includes('⏰'))
      }
    };

    logStep("✅ Monitoramento concluído", resultado.metricas);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("❌ Erro no monitoramento", { error: error.message });
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
      status: 'error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
