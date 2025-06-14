
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Clock, Star, StarOff, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProcessoDetalhes from './ProcessoDetalhes';

const ConsultaProcessual: React.FC = () => {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const { toast } = useToast();

  const handleConsulta = async () => {
    if (!numeroProcesso.trim()) {
      toast({
        title: "Erro",
        description: "Digite o número do processo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: 'numero',
          termo: numeroProcesso.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        setResultado(data.data);
        
        // Verificar se já é favorito
        const { data: favorito } = await supabase
          .from('processos_favoritos')
          .select('id')
          .eq('numero_processo', numeroProcesso.trim())
          .single();
        
        setIsFavorito(!!favorito);

        toast({
          title: "Consulta realizada",
          description: data.fromCache ? "Dados obtidos do cache" : "Dados atualizados"
        });
      } else {
        throw new Error(data.error || 'Erro na consulta');
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar o processo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorito = async () => {
    if (!resultado) return;

    try {
      if (isFavorito) {
        await supabase
          .from('processos_favoritos')
          .delete()
          .eq('numero_processo', resultado.numero_processo);
        
        setIsFavorito(false);
        toast({
          title: "Removido dos favoritos",
          description: "Processo removido da lista de favoritos"
        });
      } else {
        await supabase
          .from('processos_favoritos')
          .insert({
            numero_processo: resultado.numero_processo,
            nome_processo: `${resultado.classe} - ${resultado.assunto}`,
            tribunal: resultado.tribunal,
            data_ultima_movimentacao: resultado.data_ultima_movimentacao,
            status_processo: resultado.status
          });
        
        setIsFavorito(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "Processo salvo na lista de favoritos"
        });
      }
    } catch (error) {
      console.error('Erro ao gerenciar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favoritos",
        variant: "destructive"
      });
    }
  };

  const gerarRelatorio = () => {
    if (!resultado) return;
    
    // Implementar geração de PDF
    toast({
      title: "Relatório",
      description: "Funcionalidade de relatório em desenvolvimento"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consulta por Número Processual
          </CardTitle>
          <CardDescription>
            Digite o NPU (Número Processual Unificado) para consultar dados do processo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero-processo">Número do Processo</Label>
            <Input
              id="numero-processo"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              placeholder="Ex: 1234567-12.2024.8.26.0001"
              onKeyPress={(e) => e.key === 'Enter' && handleConsulta()}
            />
          </div>

          <Button 
            onClick={handleConsulta} 
            disabled={!numeroProcesso.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar Processo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Resultado da Consulta</CardTitle>
                <CardDescription>Processo: {resultado.numero_processo}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFavorito}
                >
                  {isFavorito ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" />
                      Remover Favorito
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Adicionar Favorito
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={gerarRelatorio}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProcessoDetalhes processo={resultado} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultaProcessual;
