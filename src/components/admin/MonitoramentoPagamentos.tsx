import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, CheckCircle, TrendingUp, Users, CreditCard, Clock, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import GerenciamentoTrial from './GerenciamentoTrial';

interface MonitoringData {
  timestamp: string;
  status: 'healthy' | 'warning' | 'error';
  metricas: {
    assinaturas_ativas: number;
    assinaturas_em_atraso: number;
    faturas_falhas_24h: number;
    usuarios_trial_total: number;
    usuarios_trial_expirando_2d: number;
    receita_mensal_estimada: number;
  };
  logs_cancelamento_recentes: any[];
  problemas_identificados: string[];
  alertas: {
    criticos: string[];
    avisos: string[];
  };
}

const MonitoramentoPagamentos = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixingStatus, setIsFixingStatus] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchMonitoringData = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Buscando dados de monitoramento...");
      
      const { data: response, error } = await supabase.functions.invoke('sistema-monitoramento');
      
      if (error) {
        console.error("❌ Erro ao buscar dados:", error);
        throw new Error(error.message);
      }
      
      setData(response);
      setLastUpdate(new Date());
      
      // Toast baseado no status
      if (response.status === 'healthy') {
        toast({
          title: "✅ Sistema Saudável",
          description: "Todos os sistemas de pagamento funcionando normalmente.",
        });
      } else if (response.status === 'warning') {
        toast({
          title: "⚠️ Atenção Necessária",
          description: `${response.problemas_identificados.length} problemas detectados.`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("❌ Erro no monitoramento:", error);
      toast({
        title: "Erro no Monitoramento",
        description: error.message || "Falha ao carregar dados de monitoramento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fixClientSubscriptionStatus = async (email: string) => {
    setIsFixingStatus(true);
    try {
      console.log("🔧 Corrigindo status da assinatura para:", email);
      
      // Fazer a requisição diretamente para a edge function com os dados do admin
      const { data: response, error } = await supabase.functions.invoke('atualizar-status-assinatura', {
        body: { 
          email_to_fix: email,
          admin_action: true 
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "✅ Status Corrigido",
        description: `Status da assinatura de ${email} foi atualizado: ${response.status}`,
      });

      // Atualizar os dados de monitoramento
      await fetchMonitoringData();
      
    } catch (error) {
      console.error("❌ Erro ao corrigir status:", error);
      toast({
        title: "Erro ao Corrigir Status",
        description: error.message || "Falha ao atualizar status da assinatura",
        variant: "destructive",
      });
    } finally {
      setIsFixingStatus(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchMonitoringData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Administração de Pagamentos</h2>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <Button 
            onClick={fetchMonitoringData} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitoring">
            <TrendingUp className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="trial-management">
            <Calendar className="h-4 w-4 mr-2" />
            Gerenciar Trial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          {data && (
            <>
              {/* Status Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(data.status)}
                    Status do Sistema
                    <Badge className={getStatusColor(data.status)}>
                      {data.status === 'healthy' ? 'Saudável' : 
                       data.status === 'warning' ? 'Atenção' : 'Erro'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.problemas_identificados.length > 0 ? (
                    <div className="space-y-4">
                      {data.alertas.criticos.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Problemas Críticos:</strong>
                            <ul className="mt-1 list-disc list-inside">
                              {data.alertas.criticos.map((alerta, index) => (
                                <li key={index}>{alerta}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {data.alertas.avisos.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Avisos:</strong>
                            <ul className="mt-1 list-disc list-inside">
                              {data.alertas.avisos.map((aviso, index) => (
                                <li key={index}>{aviso}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Ação de Emergência para Corrigir Status */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-medium text-amber-800 mb-3">🚨 Correção de Status de Assinatura</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          Se um cliente pagou mas o status não foi atualizado corretamente, use o botão abaixo para forçar a sincronização com o Stripe:
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => fixClientSubscriptionStatus('rlaisarolim15@gmail.com')}
                            disabled={isFixingStatus}
                            variant="outline"
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-100"
                          >
                            {isFixingStatus ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Corrigir Status - rlaisarolim15@gmail.com
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-green-700">✅ Todos os sistemas funcionando normalmente.</p>
                  )}
                </CardContent>
              </Card>

              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Assinaturas Ativas</p>
                        <p className="text-2xl font-bold text-green-600">{data.metricas.assinaturas_ativas}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                        <p className="text-2xl font-bold text-red-600">{data.metricas.assinaturas_em_atraso}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Usuários Trial</p>
                        <p className="text-2xl font-bold text-blue-600">{data.metricas.usuarios_trial_total}</p>
                        <p className="text-xs text-gray-500">{data.metricas.usuarios_trial_expirando_2d} expirando</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                        <p className="text-2xl font-bold text-green-600">R$ {data.metricas.receita_mensal_estimada.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Logs Recentes */}
              {data.logs_cancelamento_recentes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancelamentos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.logs_cancelamento_recentes.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{log.canceled_count} cancelamentos</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(log.executed_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <Badge variant={log.success ? "default" : "destructive"}>
                            {log.success ? "Sucesso" : "Erro"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isLoading && !data && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando dados de monitoramento...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trial-management">
          <GerenciamentoTrial />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoramentoPagamentos;