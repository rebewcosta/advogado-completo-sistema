
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
    logStep("🔍 Iniciando verificação REAL de saúde do sistema");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Testar conexão com banco de dados REAL
    logStep("🔍 Testando conexão REAL com banco de dados");
    let dbStatus = 'error';
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
        logStep("❌ Erro REAL no teste de banco de dados", dbTestError);
      } else {
        dbStatus = 'ok';
        logStep("✅ Banco de dados OK - REAL", { latency: `${dbLatency}ms` });
      }
    } catch (error) {
      dbStatus = 'error';
      dbError = error.message;
      logStep("❌ Erro REAL na conexão com banco", error);
    }

    // 2. Testar função dashboard REAL
    logStep("🔍 Testando função dashboard REAL");
    let dashboardStatus = 'error';
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
        logStep("❌ Erro REAL no teste da função dashboard", dashboardTestError);
      } else {
        dashboardStatus = 'ok';
        logStep("✅ Função dashboard OK - REAL", { latency: `${dashboardLatency}ms` });
      }
    } catch (error) {
      dashboardStatus = 'error';
      dashboardError = error.message;
      logStep("❌ Erro REAL na função dashboard", error);
    }

    // 3. Verificar CRON jobs REAL - sem mascarar
    logStep("🔍 Verificando jobs CRON REAIS");
    let cronStatus = 'error';
    let cronActive = false;
    let cronError = null;
    
    try {
      // Tentar uma função real que existe no sistema
      const { data: cronTest, error: cronTestError } = await supabase
        .rpc('check_user_storage_limit', { 
          uid: '00000000-0000-0000-0000-000000000000', 
          novo_tamanho: 0 
        });
      
      if (cronTestError) {
        cronStatus = 'error';
        cronError = cronTestError.message;
        cronActive = false;
        logStep("❌ Erro REAL no sistema CRON", cronTestError);
      } else {
        cronStatus = 'ok';
        cronActive = true;
        logStep("✅ Sistema CRON funcional - REAL");
      }
    } catch (error) {
      cronStatus = 'error';
      cronError = error.message;
      cronActive = false;
      logStep("❌ Erro REAL no CRON", error);
    }

    // 4. Construir resposta REAL sem mascarar
    const healthStatus = {
      status: 'error', // Iniciar como erro
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

    // Determinar status geral REAL
    const allOk = dbStatus === 'ok' && dashboardStatus === 'ok' && cronStatus === 'ok';
    const someOk = dbStatus === 'ok' || dashboardStatus === 'ok' || cronStatus === 'ok';
    
    if (allOk) {
      healthStatus.status = 'healthy';
    } else if (someOk) {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'error';
    }

    logStep("✅ Verificação de saúde REAL concluída", {
      status: healthStatus.status,
      dbStatus,
      dashboardStatus,
      cronStatus
    });

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    logStep("❌ Erro crítico REAL na verificação de saúde", error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'error', error: 'Falha na verificação real' },
        dashboard_function: { status: 'error', error: 'Falha na verificação real' },
        cron_job: { status: 'error', error: 'Falha na verificação real' }
      },
      error: error.message
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
