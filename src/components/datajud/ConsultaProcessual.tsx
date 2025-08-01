import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Clock, Star, StarOff, FileDown, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProcessoDetalhes from './ProcessoDetalhes';

const ConsultaProcessual: React.FC = () => {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [isFavorito, setIsFavorito] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
    setResultado(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: 'numero',
          termo: numeroProcesso.trim()
        }
      });

      if (error) {
        console.error('Erro na chamada da função:', error);
        throw new Error(error.message || 'Erro na consulta');
      }

      console.log('Resposta da API:', data);

      if (data.success) {
        // Se não há dados (processo não encontrado)
        if (!data.data) {
          setResultado(null);
          toast({
            title: "Processo não encontrado",
            description: data.message || "O número do processo não foi encontrado na base de dados oficial do CNJ.",
            variant: "default"
          });
          return;
        }

        // Se há dados válidos
        setResultado(data.data);
        
        // Verificar se já é favorito
        if (user) {
          const { data: favorito } = await supabase
            .from('processos_favoritos')
            .select('id')
            .eq('numero_processo', numeroProcesso.trim())
            .eq('user_id', user.id)
            .single();
          
          setIsFavorito(!!favorito);
        }

        toast({
          title: "Consulta realizada com sucesso",
          description: "Dados obtidos da API oficial do CNJ DataJud"
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido na consulta');
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      
      setResultado(null);
      toast({
        title: "Erro na consulta",
        description: error.message || "Não foi possível consultar a API do CNJ. Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorito = async () => {
    if (!resultado || !user) return;

    try {
      if (isFavorito) {
        await supabase
          .from('processos_favoritos')
          .delete()
          .eq('numero_processo', resultado.numero_processo)
          .eq('user_id', user.id);
        
        setIsFavorito(false);
        toast({
          title: "Removido dos favoritos",
          description: "Processo removido da lista de favoritos"
        });
      } else {
        await supabase
          .from('processos_favoritos')
          .insert({
            user_id: user.id,
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
            Digite o NPU (Número Processual Unificado) para consultar dados oficiais do CNJ
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

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>Sistema conectado à API oficial do CNJ DataJud.</strong> Apenas dados reais serão exibidos.
            </p>
          </div>

          <Button 
            onClick={handleConsulta} 
            disabled={!numeroProcesso.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Consultando API CNJ...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar na Base CNJ
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Área de resultado - só mostra se há dados válidos */}
      {resultado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Dados Oficiais do CNJ</CardTitle>
                <CardDescription>Processo: {resultado.numero_processo}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFavorito}
                  disabled={!user}
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

      {/* Informações sobre a consulta quando não há resultado */}
      {!resultado && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <Info className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-700">
                Digite um número de processo válido para consultar os dados oficiais na base do CNJ DataJud.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultaProcessual;
