
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Spinner } from '@/components/ui/spinner';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAlertas = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prazo_alertas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlertas(data || []);
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

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const gerarNovosAlertas = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('gerar_alertas_prazos');
      
      if (error) throw error;

      toast({
        title: "Alertas gerados",
        description: `${data || 0} novos alertas foram criados.`,
      });

      fetchAlertas();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar alertas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
          {alertas.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum alerta encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Clique em "Gerar Alertas" para verificar novos prazos críticos.
              </p>
              <Button onClick={gerarNovosAlertas} disabled={isGenerating}>
                {isGenerating ? <Spinner /> : <Bell className="h-4 w-4 mr-2" />}
                Gerar Primeiro Alerta
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
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
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar Enviado
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => excluirAlerta(alerta.id)}
                      className="text-red-600 hover:text-red-700"
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
