
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Clock, Database, Activity, Calendar } from 'lucide-react';

const SystemMonitoring = () => {
  const { health, isLoading, checkHealth } = useSystemHealth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Saudável</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Degradado</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
          <p className="text-gray-600">Status em tempo real dos componentes críticos</p>
        </div>
        <div className="flex items-center gap-4">
          {health && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status Geral:</span>
              {getStatusBadge(health.status)}
            </div>
          )}
          <Button 
            onClick={checkHealth} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {health && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Database Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5" />
                Banco de Dados
              </CardTitle>
              <CardDescription>Conectividade e performance do Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.checks.database.status)}
                    <span className="text-sm capitalize">{health.checks.database.status}</span>
                  </div>
                </div>
                {health.checks.database.latency && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latência:</span>
                    <span className="text-sm font-mono">{health.checks.database.latency}</span>
                  </div>
                )}
                {health.checks.database.error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {health.checks.database.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Function Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" />
                Funções Dashboard
              </CardTitle>
              <CardDescription>Performance das consultas otimizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.checks.dashboard_function.status)}
                    <span className="text-sm capitalize">{health.checks.dashboard_function.status}</span>
                  </div>
                </div>
                {health.checks.dashboard_function.latency && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latência:</span>
                    <span className="text-sm font-mono">{health.checks.dashboard_function.latency}</span>
                  </div>
                )}
                {health.checks.dashboard_function.error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {health.checks.dashboard_function.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CRON Job Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                Jobs Automátizados
              </CardTitle>
              <CardDescription>Cancelamento automático de inadimplência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.checks.cron_job.status)}
                    <span className="text-sm capitalize">{health.checks.cron_job.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ativo:</span>
                  <span className="text-sm">
                    {health.checks.cron_job.active ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
                {health.checks.cron_job.error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {health.checks.cron_job.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>Detalhes técnicos e configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">🔧 Otimizações Implementadas</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Índices compostos para consultas rápidas</li>
                <li>✅ Funções otimizadas para dashboard</li>
                <li>✅ Cache de consultas pesadas</li>
                <li>✅ RLS (Row Level Security) em todas as tabelas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">⚡ Automações Ativas</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Cancelamento automático após 5 dias</li>
                <li>✅ Validação backend de entrada</li>
                <li>✅ Sanitização de dados</li>
                <li>✅ Monitoramento contínuo</li>
              </ul>
            </div>
          </div>
          {health && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Última verificação: {new Date(health.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
