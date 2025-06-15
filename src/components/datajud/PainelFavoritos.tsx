
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProcessoDetalhes from './ProcessoDetalhes';

const PainelFavoritos: React.FC = () => {
  const [favoritos, setFavoritos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processoDetalhado, setProcessoDetalhado] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();

  const carregarFavoritos = async () => {
    try {
      const { data, error } = await supabase
        .from('processos_favoritos')
        .select('*')
        .order('favorito_em', { ascending: false });

      if (error) throw error;
      setFavoritos(data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os favoritos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removerFavorito = async (id: string, numeroProcesso: string) => {
    try {
      const { error } = await supabase
        .from('processos_favoritos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavoritos(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Removido",
        description: `Processo ${numeroProcesso} removido dos favoritos`
      });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o favorito",
        variant: "destructive"
      });
    }
  };

  const atualizarFavoritos = async () => {
    setIsRefreshing(true);
    await carregarFavoritos();
    setIsRefreshing(false);
    toast({
      title: "Atualizado",
      description: "Lista de favoritos atualizada"
    });
  };

  const consultarDetalhes = async (numeroProcesso: string) => {
    setIsLoadingDetails(true);
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
      console.error('Erro ao consultar detalhes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível consultar os detalhes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    carregarFavoritos();
  }, []);

  if (processoDetalhado) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setProcessoDetalhado(null)}
        >
          ← Voltar aos favoritos
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Carregando favoritos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Meus Processos Favoritos
              </CardTitle>
              <CardDescription>
                {favoritos.length} processo(s) favoritado(s)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={atualizarFavoritos}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {favoritos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum processo favoritado
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione processos aos favoritos para acompanhar rapidamente as atualizações
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {favoritos.map((favorito) => (
            <Card key={favorito.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{favorito.numero_processo}</h3>
                    <p className="text-gray-600">{favorito.nome_processo}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => consultarDetalhes(favorito.numero_processo)}
                      disabled={isLoadingDetails}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removerFavorito(favorito.id, favorito.numero_processo)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Tribunal</p>
                    <p className="font-medium">{favorito.tribunal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={favorito.status_processo === 'Em andamento' ? 'default' : 'secondary'}>
                      {favorito.status_processo}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Última Movimentação</p>
                    <p className="font-medium">
                      {favorito.data_ultima_movimentacao ? 
                        new Date(favorito.data_ultima_movimentacao).toLocaleDateString('pt-BR') : 
                        'Não informado'
                      }
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Favoritado em {new Date(favorito.favorito_em).toLocaleDateString('pt-BR')} às {new Date(favorito.favorito_em).toLocaleTimeString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PainelFavoritos;
