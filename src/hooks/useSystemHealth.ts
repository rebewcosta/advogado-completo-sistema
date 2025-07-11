
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
      console.log('🔍 Iniciando verificação REAL de saúde do sistema...');
      
      const { data, error } = await supabase.functions.invoke('system-health');
      
      if (error) {
        console.error('❌ Erro REAL na chamada da função:', error);
        // NÃO mascarar o erro - mostrar o erro real
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'error', error: `Erro real: ${error.message}` },
            dashboard_function: { status: 'error', error: `Erro real: ${error.message}` },
            cron_job: { status: 'error', error: `Erro real: ${error.message}` }
          }
        });
        return;
      }

      if (!data) {
        console.error('❌ Nenhuma resposta REAL recebida');
        // NÃO mascarar - mostrar que realmente não há resposta
        setHealth({
          status: 'error',
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: 'error', error: 'Servidor não respondeu (real)' },
            dashboard_function: { status: 'error', error: 'Servidor não respondeu (real)' },
            cron_job: { status: 'error', error: 'Servidor não respondeu (real)' }
          }
        });
        return;
      }

      console.log('✅ Dados de saúde REAIS recebidos:', data);
      setHealth(data as SystemHealth);
      
    } catch (error) {
      console.error('❌ Erro REAL na verificação de saúde:', error);
      // NÃO mascarar - mostrar o erro real que aconteceu
      setHealth({
        status: 'error',
        timestamp: new Date().toISOString(),
        checks: {
          database: { status: 'error', error: `Erro real do sistema: ${error}` },
          dashboard_function: { status: 'error', error: `Erro real do sistema: ${error}` },
          cron_job: { status: 'error', error: `Erro real do sistema: ${error}` }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Verificar health a cada 5 minutos para monitoramento real
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    isLoading,
    checkHealth
  };
};
