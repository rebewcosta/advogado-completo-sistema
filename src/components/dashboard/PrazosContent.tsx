
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
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

const PrazosContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prazos, setPrazos] = useState<PrazoCritico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrazos = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      setError("Usuário não autenticado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_prazos_criticos', {
        p_user_id: user.id,
        p_dias_limite: 15
      });

      if (error) throw error;

      setPrazos(data || []);

    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados de prazos.");
      toast({
        title: "Erro ao carregar prazos",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPrazos();
  }, [fetchPrazos]);

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
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-gray-800">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500"/>
            Prazos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="h-48 flex justify-center items-center">
          <Spinner/>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center">
            <AlertTriangle className="mr-2"/>
            Erro no Monitor de Prazos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchPrazos} className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4"/> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-gray-800">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-500"/>
          Prazos Críticos (15 dias)
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Prazos que precisam de atenção imediata
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px]">
        {prazos.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {prazos.slice(0, 5).map((prazo) => (
              <div
                key={prazo.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border bg-white/50 backdrop-blur-sm",
                  prazo.nivel_criticidade === 'critico' && "border-red-200 bg-red-50/50",
                  prazo.nivel_criticidade === 'urgente' && "border-orange-200 bg-orange-50/50",
                  prazo.nivel_criticidade === 'medio' && "border-yellow-200 bg-yellow-50/50"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {prazo.titulo}
                    </h4>
                    <Badge variant="outline" className={cn("text-[10px] py-0.5 px-1.5 font-medium rounded-full capitalize", getBadgeColor(prazo.nivel_criticidade))}>
                      {prazo.nivel_criticidade}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(prazo.data_prazo), "dd/MM/yyyy", { locale: ptBR })}
                      <span className="font-medium">
                        ({prazo.dias_restantes} {prazo.dias_restantes === 1 ? 'dia' : 'dias'})
                      </span>
                    </div>
                    
                    {prazo.detalhes.cliente && (
                      <div className="text-[11px] text-gray-500 truncate">
                        Cliente: {prazo.detalhes.cliente}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {prazos.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  E mais {prazos.length - 5} prazo(s)...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum prazo crítico encontrado</p>
            <p className="text-xs text-gray-400">Todos os seus prazos estão sob controle!</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm" className="bg-white/50 hover:bg-white/70 border-gray-300">
            <Link to="/prazos">
              Ver Todos os Prazos
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrazosContent;
