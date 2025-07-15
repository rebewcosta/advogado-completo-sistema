import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 [OFFLINE-MONITOR] Iniciando monitoramento de usuários offline");

    // Criar cliente Supabase com service role para executar a função
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Executar a função para marcar usuários como offline
    const { error: functionError } = await supabaseAdmin.rpc('mark_users_offline_after_timeout');
    
    if (functionError) {
      console.error("❌ [OFFLINE-MONITOR] Erro ao executar função:", functionError);
      throw functionError;
    }

    // Buscar estatísticas atuais
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_profiles')
      .select('is_online')
      .not('is_online', 'is', null);

    if (statsError) {
      console.error("❌ [OFFLINE-MONITOR] Erro ao buscar estatísticas:", statsError);
      throw statsError;
    }

    const onlineCount = stats?.filter(user => user.is_online).length || 0;
    const totalCount = stats?.length || 0;
    const offlineCount = totalCount - onlineCount;

    console.log("✅ [OFFLINE-MONITOR] Monitoramento concluído");
    console.log(`📊 [OFFLINE-MONITOR] Estatísticas: ${onlineCount} online, ${offlineCount} offline, ${totalCount} total`);

    return new Response(JSON.stringify({
      success: true,
      message: "Monitoramento de usuários offline executado com sucesso",
      stats: {
        online: onlineCount,
        offline: offlineCount,
        total: totalCount
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("❌ [OFFLINE-MONITOR] Erro no monitoramento:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro interno do servidor"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});