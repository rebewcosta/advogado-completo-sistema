
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Eye,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  lastCheck: string;
  responseTime: number;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  service: string;
  message: string;
  details?: any;
}

interface RealMetrics {
  usuariosAtivos: number;
  totalUsuarios: number;
  pagamentosHoje: number;
  taxaSucesso: number;
}

const SystemMonitoring = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'operational',
    lastCheck: new Date().toISOString(),
    responseTime: 120
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realMetrics, setRealMetrics] = useState<RealMetrics>({
    usuariosAtivos: 0,
    totalUsuarios: 0,
    pagamentosHoje: 0,
    taxaSucesso: 0
  });
  const { toast } = useToast();

  const fetchRealMetrics = async () => {
    try {
      addLog('info', 'Metrics', 'Buscando métricas reais do sistema...');

      // 1. Buscar total de usuários registrados
      const { data: allUsers, error: usersError } = await supabase.functions.invoke('system-health');
      
      // 2. Buscar usuários ativos (logados nas últimas 24h)
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // 3. Buscar total de usuários
      const { count: totalUsersCount } = await supabase
        .from('profiles') 
        .select('*', { count: 'exact', head: true });

      // 4. Buscar transações de hoje (como proxy para pagamentos)
      const hoje = new Date().toISOString().split('T')[0];
      const { count: todayTransactions } = await supabase
        .from('transacoes_financeiras')
        .select('*', { count: 'exact', head: true })
        .eq('data_transacao', hoje)
        .eq('tipo_transacao', 'Receita')
        .eq('status_pagamento', 'Recebido');

      // 5. Calcular taxa de sucesso baseada em transações bem-sucedidas vs tentativas
      const { count: successfulTransactions } = await supabase
        .from('transacoes_financeiras')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('status_pagamento', 'Recebido');

      const { count: totalTransactions } = await supabase
        .from('transacoes_financeiras')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const taxaSucesso = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 100;

      setRealMetrics({
        usuariosAtivos: activeUsersCount || 0,
        totalUsuarios: totalUsersCount || 0,
        pagamentosHoje: todayTransactions || 0,
        taxaSucesso: Math.round(taxaSucesso * 10) / 10
      });

      addLog('info', 'Metrics', `Métricas atualizadas: ${activeUsersCount || 0} usuários ativos, ${todayTransactions || 0} pagamentos hoje`);

    } catch (error: any) {
      addLog('error', 'Metrics', 'Erro ao buscar métricas reais', { error: error.message });
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      // Teste de conectividade com Supabase usando system-health
      const { data, error } = await supabase.functions.invoke('system-health');
      const responseTime = Date.now() - startTime;
      
      if (error) {
        setSystemStatus({
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime
        });
        
        addLog('error', 'System Health', 'Sistema apresentando problemas', { error: error.message });
      } else {
        setSystemStatus({
          status: 'operational',
          lastCheck: new Date().toISOString(),
          responseTime
        });
        
        addLog('info', 'System Health', 'Sistema operacional');
      }

      // Buscar métricas reais após verificar saúde
      await fetchRealMetrics();

    } catch (error: any) {
      setSystemStatus({
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
      
      addLog('error', 'System Health', 'Sistema indisponível', { error: error.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  const addLog = (level: 'info' | 'warning' | 'error', service: string, message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      details
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Manter apenas os últimos 50 logs
  };

  const testPaymentFlow = async () => {
    addLog('info', 'Payment Test', 'Iniciando teste do fluxo de pagamento...');
    
    try {
      // Testar webhook do Stripe
      const { data, error } = await supabase.functions.invoke('webhook-stripe', {
        body: { test: true }
      });
      
      if (error) {
        addLog('warning', 'Payment Test', 'Webhook Stripe não configurado ou com problemas', { error: error.message });
      } else {
        addLog('info', 'Payment Test', 'Fluxo de pagamento operacional');
      }
      
      toast({
        title: "Teste Concluído",
        description: "Verificação do fluxo de pagamento realizada.",
      });
    } catch (error: any) {
      addLog('error', 'Payment Test', 'Erro no fluxo de pagamento', { error: error.message });
      
      toast({
        title: "Erro no Teste",
        description: "Problemas detectados no fluxo de pagamento.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Atualizar status a cada 5 minutos
    const interval = setInterval(checkSystemHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Geral do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(systemStatus.status)}>
                {getStatusIcon(systemStatus.status)}
                <span className="ml-1 capitalize">{systemStatus.status}</span>
              </Badge>
              <span className="text-sm text-gray-500">
                Tempo de resposta: {systemStatus.responseTime}ms
              </span>
            </div>
            <Button
              onClick={checkSystemHealth}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Última verificação: {new Date(systemStatus.lastCheck).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      {/* Métricas e Logs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Usuários Ativos</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{realMetrics.usuariosAtivos}</p>
                <p className="text-xs text-gray-500">Últimas 24h</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Pagamentos</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{realMetrics.pagamentosHoje}</p>
                <p className="text-xs text-gray-500">Hoje</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Taxa de Sucesso</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{realMetrics.taxaSucesso}%</p>
                <p className="text-xs text-gray-500">Última semana</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <strong>Dados Reais em Tempo Real:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Usuários ativos: Baseado em perfis atualizados nas últimas 24h</li>
                  <li>Pagamentos: Receitas confirmadas hoje no sistema</li>
                  <li>Taxa de sucesso: Transações bem-sucedidas vs tentativas (7 dias)</li>
                  <li>Atualização automática a cada 5 minutos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Logs do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum log disponível</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                          <Badge variant="outline" className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{log.service}</span>
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Testes de Produção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testPaymentFlow} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Testar Fluxo de Pagamento
              </Button>
              
              <Button onClick={checkSystemHealth} variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Testar Conectividade Sistema
              </Button>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Testes Automáticos:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Verificação de conectividade a cada 5 minutos</li>
                  <li>Teste de webhooks do Stripe</li>
                  <li>Validação de métricas reais</li>
                  <li>Monitoramento de tempo de resposta</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring;
