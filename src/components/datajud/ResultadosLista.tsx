
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProcessoDetalhes from './ProcessoDetalhes';

interface ResultadosListaProps {
  resultados: any[];
}

const ResultadosLista: React.FC<ResultadosListaProps> = ({ resultados }) => {
  const [processoDetalhado, setProcessoDetalhado] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerDetalhes = async (numeroProcesso: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: 'numero',
          termo: numeroProcesso
        }
      });

      if (error) throw error;

      if (data.success) {
        setProcessoDetalhado(data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (processoDetalhado) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setProcessoDetalhado(null)}
        >
          ← Voltar aos resultados
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Processo</CardTitle>
            <CardDescription>Processo: {processoDetalhado.numero_processo}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProcessoDetalhes processo={processoDetalhado} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter out null/undefined results and ensure they have required properties
  const validResultados = resultados.filter(processo => 
    processo && 
    processo.numero_processo && 
    typeof processo.numero_processo === 'string'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Resultados da Busca
        </CardTitle>
        <CardDescription>
          {validResultados.length} processo(s) encontrado(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validResultados.map((processo, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{processo.numero_processo}</h3>
                  <p className="text-gray-600">{processo.classe || 'Classe não informada'}</p>
                </div>
                <Badge variant={processo.status === 'Em andamento' ? 'default' : 'secondary'}>
                  {processo.status || 'Status não informado'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{processo.tribunal || 'Tribunal não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Ajuizado em {
                      processo.data_ajuizamento 
                        ? new Date(processo.data_ajuizamento).toLocaleDateString('pt-BR')
                        : 'Data não informada'
                    }
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVerDetalhes(processo.numero_processo)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Ver Detalhes'}
                </Button>
              </div>
            </div>
          ))}
          
          {validResultados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum processo válido encontrado nos resultados.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultadosLista;
