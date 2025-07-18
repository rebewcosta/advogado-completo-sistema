/**
 * Utilitários para detectar o ambiente de execução
 */

/**
 * Detecta se estamos rodando no ambiente de preview do Lovable
 */
export const isLovablePreview = (): boolean => {
  return window.location.hostname.includes('.lovableproject.com');
};

/**
 * Detecta se estamos em ambiente de desenvolvimento
 */
export const isDevelopment = (): boolean => {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.lovableproject.com')
  );
};

/**
 * Detecta se estamos em ambiente de produção
 */
export const isProduction = (): boolean => {
  return !isDevelopment();
};

/**
 * Obtém a URL base para edge functions baseada no ambiente
 */
export const getEdgeFunctionUrl = (functionName: string): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqprcsquknlegzmzdoct.supabase.co';
  return `${supabaseUrl}/functions/v1/${functionName}`;
};

/**
 * Verifica se devemos pular verificações de autenticação no ambiente atual
 */
export const shouldSkipAuthChecks = (): boolean => {
  return isDevelopment() && (isLovablePreview() || window.location.hostname === 'localhost');
};

/**
 * Obtém informações do ambiente atual
 */
export const getEnvironmentInfo = () => {
  return {
    hostname: window.location.hostname,
    isLovablePreview: isLovablePreview(),
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    shouldSkipAuthChecks: shouldSkipAuthChecks(),
  };
};