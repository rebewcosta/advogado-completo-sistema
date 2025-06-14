
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const checkRateLimit = async (userId: string, supabase: any) => {
  const { data: recentLogs } = await supabase
    .from('logs_monitoramento')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .limit(5);

  return recentLogs && recentLogs.length >= 5;
};
