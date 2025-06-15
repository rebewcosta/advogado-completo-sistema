
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle, Clock, Calendar, RefreshCw, FileText, Users } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PrazoCritico {
  id: string;
  tipo: string;
  titulo: string;
  data_prazo: string;
  dias_restantes: number;
  nivel_criticidade: string;
  detalhes: any;
}

export const PrazosDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prazos, setPrazos] = useState<PrazoCritico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    criticos: 0,
    urgentes: 0,
    medios: 0,
    total: 0
  });

  const fetchPrazos = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_prazos_criticos', {
        p_user_id: user.id,
        p_dias_limite: 30
      });

      if (error) throw error;

      setPrazos(data || []);
      
      // Calcular estatísticas
      const criticos = data?.filter(p => p.nivel_criticidade === 'critico').length || 0;
      const urgentes = data?.filter(p => p.nivel_criticidade === 'urgente').length || 0;
      const medios = data?.filter(p => p.nivel_criticidade === 'medio').length || 0;
      
      setStats({
        criticos,
        urgentes,
        medios,
        total: criticos + urgentes + medios
      });

    } catch (error: any) {
      console.error('Erro ao buscar prazos:', error);
      toast({
        title: "Erro ao carregar prazos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPrazos();
  }, [fetchPrazos]);

  const getBadgeVariant = (nivel: string) => {
    switch (nivel) {
      case 'critico': return 'destructive';
      case 'urgente': return 'default';
      case 'medio': return 'secondary';
      default: return 'outline';
    }
  };

  const getBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'critico': return 'bg-red-100 text-red-700 border-red-200';
      case 'urgente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medio': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="h-32 flex justify-center items-center">
                <Spinner />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.criticos}</div>
            <p className="text-xs text-red-600">≤ 3 dias</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Urgentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.urgentes}</div>
            <p className="text-xs text-orange-600">≤ 7 dias</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Médios</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.medios}</div>
            <p className="text-xs text-yellow-600">≤ 15 dias</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <p className="text-xs text-blue-600">próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Prazos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prazos Críticos
              </CardTitle>
              <CardDescription>
                Próximos prazos que precisam de atenção
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPrazos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {prazos.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum prazo crítico encontrado
              </h3>
              <p className="text-gray-500">
                Todos os seus prazos estão sob controle!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prazos.map((prazo) => (
                <div
                  key={prazo.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    prazo.nivel_criticidade === 'critico' && "border-red-200 bg-red-50",
                    prazo.nivel_criticidade === 'urgente' && "border-orange-200 bg-orange-50",
                    prazo.nivel_criticidade === 'medio' && "border-yellow-200 bg-yellow-50"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{prazo.titulo}</h4>
                      <Badge variant="outline" className={getBadgeColor(prazo.nivel_criticidade)}>
                        {prazo.nivel_criticidade.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Vence em: {format(new Date(prazo.data_prazo), "dd/MM/yyyy", { locale: ptBR })}
                        <span className="font-medium">
                          ({prazo.dias_restantes} {prazo.dias_restantes === 1 ? 'dia' : 'dias'})
                        </span>
                      </div>
                      
                      {prazo.detalhes.cliente && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Cliente: {prazo.detalhes.cliente}
                        </div>
                      )}
                      
                      {prazo.detalhes.numero_processo && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Processo: {prazo.detalhes.numero_processo}
                        </div>
                      )}
                      
                      {prazo.detalhes.tipo_evento && (
                        <div className="text-xs text-gray-500">
                          Tipo: {prazo.detalhes.tipo_evento}
                        </div>
                      )}
                    </div>
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
