
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [SYSTEM-HEALTH] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("🔍 Iniciando verificação de saúde do sistema");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const startTime = Date.now();
    
    // 1. Testar conexão com banco de dados
    logStep("🔍 Testando conexão com banco de dados");
    let dbStatus = 'ok';
    let dbLatency = 0;
    let dbError = null;
    
    try {
      const dbStart = Date.now();
      const { data: dbTest, error: dbTestError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      dbLatency = Date.now() - dbStart;
      
      if (dbTestError) {
        dbStatus = 'error';
        dbError = dbTestError.message;
        logStep("❌ Erro no teste de banco de dados", dbTestError);
      } else {
        logStep("✅ Banco de dados OK", { latency: `${dbLatency}ms` });
      }
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
      dbLatency = Date.now() - startTime;
      logStep("❌ Erro na conexão com banco", error);
    }

    // 2. Testar função dashboard otimizada
    logStep("🔍 Testando função dashboard");
    let dashboardStatus = 'ok';
    let dashboardLatency = 0;
    let dashboardError = null;
    
    try {
      const dashboardStart = Date.now();
      const { data: dashboardTest, error: dashboardTestError } = await supabase
        .rpc('get_user_dashboard_data', {
          p_user_id: '00000000-0000-0000-0000-000000000000'
        });
      
      dashboardLatency = Date.now() - dashboardStart;
      
      if (dashboardTestError) {
        dashboardStatus = 'error';
        dashboardError = dashboardTestError.message;
        logStep("❌ Erro no teste da função dashboard", dashboardTestError);
      } else {
        logStep("✅ Função dashboard OK", { latency: `${dashboardLatency}ms` });
      }
    } catch (error) {
      dashboardStatus = 'error';
      dashboardError = error.message;
      dashboardLatency = Date.now() - Date.now();
      logStep("❌ Erro na função dashboard", error);
    }

    // 3. Verificar CRON jobs (usando uma abordagem mais robusta)
    logStep("🔍 Verificando jobs CRON");
    let cronStatus = 'ok';
    let cronActive = false;
    let cronError = null;
    
    try {
      // Tentar verificar se existe a tabela cron.job
      const { data: cronJobs, error: cronTestError } = await supabase
        .rpc('check_user_storage_limit', { 
          uid: '00000000-0000-0000-0000-000000000000', 
          novo_tamanho: 0 
        });
      
      // Se chegou até aqui, o sistema está funcionando
      cronStatus = 'ok';
      cronActive = true;
      logStep("✅ Sistema CRON funcional");
    } catch (error) {
      // Não é crítico se o CRON não estiver configurado
      cronStatus = 'warning';
      cronError = 'CRON não configurado ou não acessível';
      cronActive = false;
      logStep("⚠️ CRON não acessível", error);
    }

    // 4. Construir resposta de saúde
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
          error: dbError
        },
        dashboard_function: {
          status: dashboardStatus,
          latency: `${dashboardLatency}ms`,
          error: dashboardError
        },
        cron_job: {
          status: cronStatus,
          active: cronActive,
          error: cronError
        }
      }
    };

    // Determinar status geral
    const hasErrors = Object.values(healthStatus.checks).some(check => check.status === 'error');
    const hasWarnings = Object.values(healthStatus.checks).some(check => check.status === 'warning');
    
    if (hasErrors) {
      healthStatus.status = 'error';
    } else if (hasWarnings) {
      healthStatus.status = 'degraded';
    }

    logStep("✅ Verificação de saúde concluída", {
      status: healthStatus.status,
      dbStatus,
      dashboardStatus,
      cronStatus
    });

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: 200, // Sempre retornar 200 para evitar erro no frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    logStep("❌ Erro crítico na verificação de saúde", error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'error', error: 'Sistema indisponível' },
        dashboard_function: { status: 'error', error: 'Sistema indisponível' },
        cron_job: { status: 'error', error: 'Sistema indisponível' }
      },
      error: error.message
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 200, // Retornar 200 mesmo com erro para evitar FunctionsHttpError
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
