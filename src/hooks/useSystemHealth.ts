
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  status: string;
  latency?: string;
  error?: string;
  active?: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: string;
  checks: {
    database: HealthCheck;
    dashboard_function: HealthCheck;
    cron_job: HealthCheck;
  };
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('system-health');
      
      if (error) {
        console.error('Erro no health check:', error);
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'error', error: 'Não foi possível verificar' },
            dashboard_function: { status: 'error', error: 'Não foi possível verificar' },
            cron_job: { status: 'error', error: 'Não foi possível verificar' }
          }
        });
        return;
      }

      setHealth(data as SystemHealth);
    } catch (error) {
      console.error('Erro no health check:', error);
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'error', error: 'Sistema indisponível' },
          dashboard_function: { status: 'error', error: 'Sistema indisponível' },
          cron_job: { status: 'error', error: 'Sistema indisponível' }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Verificar health a cada 5 minutos
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    isLoading,
    checkHealth
  };
};
