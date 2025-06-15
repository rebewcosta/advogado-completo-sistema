import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, CheckCircle, RefreshCw, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AlertaPrazo {
  id: string;
  tipo_prazo: string;
  tipo_alerta: string;
  data_prazo: string;
  dias_restantes: number;
  titulo: string;
  descricao: string;
  alerta_enviado: boolean;
  data_envio: string;
  created_at: string;
}

export const PrazosAlertas: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alertas, setAlertas] = useState<AlertaPrazo[]>([]);
  const [alertasFiltrados, setAlertasFiltrados] = useState<AlertaPrazo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState('');

  const fetchAlertas = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prazo_alertas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAlertas(data || []);
      setAlertasFiltrados(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alertas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const filtrarAlertas = useCallback(() => {
    let alertasFiltradosTemp = [...alertas];

    // Filtro por status
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'enviados') {
        alertasFiltradosTemp = alertasFiltradosTemp.filter(a => a.alerta_enviado);
      } else if (filtroStatus === 'pendentes') {
        alertasFiltradosTemp = alertasFiltradosTemp.filter(a => !a.alerta_enviado);
      }
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      alertasFiltradosTemp = alertasFiltradosTemp.filter(a => a.tipo_alerta === filtroTipo);
    }

    // Filtro por busca
    if (termoBusca) {
      alertasFiltradosTemp = alertasFiltradosTemp.filter(a => 
        a.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        a.descricao.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }

    setAlertasFiltrados(alertasFiltradosTemp);
  }, [alertas, filtroStatus, filtroTipo, termoBusca]);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  useEffect(() => {
    filtrarAlertas();
  }, [filtrarAlertas]);

  const gerarNovosAlertas = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log('=== INICIANDO GERAÇÃO DE ALERTAS ===');
    
    try {
      // Obter o token de sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Erro ao obter sessão:', sessionError);
        throw new Error('Sessão não encontrada. Faça login novamente.');
      }

      console.log('Sessão obtida com sucesso. Chamando função gerar-alertas...');
      
      // Chamar a função Edge
      const { data, error } = await supabase.functions.invoke('gerar-alertas', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log('Resposta da função:', { data, error });
      
      if (error) {
        console.error('Erro retornado pela função:', error);
        throw new Error(error.message || 'Erro ao chamar a função de alertas');
      }

      if (!data) {
        throw new Error('Nenhuma resposta recebida da função');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido na função');
      }

      const alertasGerados = data.alertas_gerados || 0;
      
      toast({
        title: "Alertas gerados com sucesso!",
        description: `${alertasGerados} ${alertasGerados === 1 ? 'novo alerta foi criado' : 'novos alertas foram criados'}.`,
      });

      // Recarregar a lista de alertas
      await fetchAlertas();
      
    } catch (error: any) {
      console.error('Erro completo ao gerar alertas:', error);
      
      let errorMessage = 'Erro desconhecido ao gerar alertas';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro ao gerar alertas",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      console.log('=== FIM DA GERAÇÃO DE ALERTAS ===');
    }
  };

  const marcarComoEnviado = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('prazo_alertas')
        .update({ 
          alerta_enviado: true,
          data_envio: new Date().toISOString()
        })
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Alerta marcado como enviado",
      });

      fetchAlertas();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const excluirAlerta = async (alertaId: string) => {
    try {
      const { error } = await supabase
        .from('prazo_alertas')
        .delete()
        .eq('id', alertaId);

      if (error) throw error;

      toast({
        title: "Alerta excluído",
      });

      fetchAlertas();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'critico': return 'bg-red-100 text-red-700 border-red-200';
      case 'urgente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const resetFiltros = () => {
    setFiltroStatus('todos');
    setFiltroTipo('todos');
    setTermoBusca('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex justify-center items-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
              <CardDescription>
                Gerencie e visualize todos os alertas de prazos
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAlertas}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button 
                size="sm" 
                onClick={gerarNovosAlertas}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Spinner />
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Gerar Alertas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    <SelectItem value="pendentes">Pendentes</SelectItem>
                    <SelectItem value="enviados">Enviados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="critico">Crítico</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button variant="outline" onClick={resetFiltros} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {alertasFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {alertas.length === 0 ? "Nenhum alerta encontrado" : "Nenhum alerta encontrado com os filtros aplicados"}
              </h3>
              <p className="text-gray-500 mb-4">
                {alertas.length === 0 
                  ? "Clique em 'Gerar Alertas' para verificar novos prazos críticos."
                  : "Tente ajustar os filtros para ver mais resultados."
                }
              </p>
              {alertas.length === 0 && (
                <Button onClick={gerarNovosAlertas} disabled={isGenerating}>
                  {isGenerating ? <Spinner /> : <Bell className="h-4 w-4 mr-2" />}
                  Gerar Primeiro Alerta
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-4">
                Mostrando {alertasFiltrados.length} de {alertas.length} alertas
              </div>
              {alertasFiltrados.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                      <Badge variant="outline" className={getBadgeColor(alerta.tipo_alerta)}>
                        {alerta.tipo_alerta.toUpperCase()}
                      </Badge>
                      {alerta.alerta_enviado && (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                          ENVIADO
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{alerta.descricao}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Vencimento: {format(new Date(alerta.data_prazo), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span>Criado: {format(new Date(alerta.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        {alerta.data_envio && (
                          <span>Enviado: {format(new Date(alerta.data_envio), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!alerta.alerta_enviado && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => marcarComoEnviado(alerta.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar Enviado
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => excluirAlerta(alerta.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
