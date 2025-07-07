
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const startTime = Date.now()
    
    // Testar conexão com banco
    const { data: dbTest, error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    const dbLatency = Date.now() - startTime

    // Testar função dashboard otimizada
    const dashboardStart = Date.now()
    const { data: dashboardTest, error: dashboardError } = await supabase.rpc('get_user_dashboard_data', {
      p_user_id: '00000000-0000-0000-0000-000000000000' // UUID fake para teste
    })
    const dashboardLatency = Date.now() - dashboardStart

    // Verificar CRON job
    const { data: cronJobs, error: cronError } = await supabase
      .from('cron.job')
      .select('*')
      .eq('jobname', 'gerenciar-inadimplencia-diaria')

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbError ? 'error' : 'ok',
          latency: `${dbLatency}ms`,
          error: dbError?.message
        },
        dashboard_function: {
          status: dashboardError ? 'error' : 'ok',
          latency: `${dashboardLatency}ms`,
          error: dashboardError?.message
        },
        cron_job: {
          status: cronError || !cronJobs?.length ? 'error' : 'ok',
          active: cronJobs?.length > 0,
          error: cronError?.message
        }
      }
    }

    // Determinar status geral
    const hasErrors = Object.values(healthStatus.checks).some(check => check.status === 'error')
    healthStatus.status = hasErrors ? 'degraded' : 'healthy'

    return new Response(
      JSON.stringify(healthStatus),
      { 
        status: hasErrors ? 503 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no health check:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        error: 'Sistema indisponível',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
