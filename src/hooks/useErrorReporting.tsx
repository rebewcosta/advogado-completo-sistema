
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ErrorReport {
  error: Error;
  componentName?: string;
  severity?: 'error' | 'warning' | 'info';
  additionalData?: any;
}

export const useErrorReporting = () => {
  const { user } = useAuth();

  const reportError = useCallback(async ({
    error,
    componentName,
    severity = 'error',
    additionalData
  }: ErrorReport) => {
    try {
      await supabase
        .from('system_error_logs')
        .insert({
          user_id: user?.id || null,
          error_type: error.name || 'Unknown Error',
          error_message: error.message,
          component_name: componentName,
          stack_trace: error.stack,
          user_agent: navigator.userAgent,
          url: window.location.href,
          severity,
          timestamp: new Date().toISOString()
        });

      console.error('Erro reportado:', {
        error,
        componentName,
        severity,
        additionalData
      });
    } catch (reportingError) {
      console.error('Falha ao reportar erro:', reportingError);
    }
  }, [user]);

  return { reportError };
};

// Hook global para capturar erros não tratados
export const useGlobalErrorHandler = () => {
  const { reportError } = useErrorReporting();

  useCallback(() => {
    // Capturar erros JavaScript não tratados
    const handleError = (event: ErrorEvent) => {
      reportError({
        error: new Error(event.message),
        componentName: 'Global Error Handler',
        severity: 'error'
      });
    };

    // Capturar promises rejeitadas não tratadas
    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError({
        error: new Error(String(event.reason)),
        componentName: 'Promise Rejection Handler',
        severity: 'warning'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [reportError]);
};
