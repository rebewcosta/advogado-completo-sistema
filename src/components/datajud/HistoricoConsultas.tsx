
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Search, User, FileText, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const HistoricoConsultas: React.FC = () => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const carregarHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('historico_consultas')
        .select('*')
        .order('consultado_em', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistorico(data || []);

      // Calcular estatísticas
      if (data && data.length > 0) {
        const stats = {
          total_consultas: data.length,
          por_tipo: data.reduce((acc: any, item: any) => {
            acc[item.tipo_consulta] = (acc[item.tipo_consulta] || 0) + 1;
            return acc;
          }, {}),
          ultimos_7_dias: data.filter((item: any) => {
            const date = new Date(item.consultado_em);
            const hoje = new Date();
            const diffTime = hoje.getTime() - date.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }).length
        };
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'numero':
        return <Search className="h-4 w-4" />;
      case 'nome':
        return <User className="h-4 w-4" />;
      case 'documento':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'numero':
        return 'Número';
      case 'nome':
        return 'Nome';
      case 'documento':
        return 'Documento';
      default:
        return tipo;
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <History className="h-8 w-8 animate-pulse mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{estatisticas.total_consultas}</p>
              <p className="text-sm text-gray-600">Total de consultas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{estatisticas.ultimos_7_dias}</p>
              <p className="text-sm text-gray-600">Últimos 7 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{estatisticas.por_tipo.numero || 0}</p>
              <p className="text-sm text-gray-600">Por número</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista do Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Consultas
          </CardTitle>
          <CardDescription>
            Suas últimas {historico.length} consultas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta realizada
              </h3>
              <p className="text-gray-500">
                Suas consultas aparecerão aqui automaticamente
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico.map((consulta) => (
                <div key={consulta.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTipoIcon(consulta.tipo_consulta)}
                      <Badge variant="outline">
                        {getTipoLabel(consulta.tipo_consulta)}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{consulta.termo_busca}</p>
                      {consulta.tribunal && (
                        <p className="text-sm text-gray-500">Tribunal: {consulta.tribunal}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(consulta.consultado_em).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(consulta.consultado_em).toLocaleTimeString('pt-BR')}
                    </p>
                    {consulta.resultados_encontrados !== null && (
                      <Badge variant={consulta.resultados_encontrados > 0 ? 'default' : 'secondary'}>
                        {consulta.resultados_encontrados} resultado(s)
                      </Badge>
                    )}
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

export default HistoricoConsultas;
