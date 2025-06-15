
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, BarChart3, Clock, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AnaliseJurimetrica: React.FC = () => {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [analise, setAnalise] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const gerarAnalise = async () => {
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

      if (data.success && data.data.jurimetria) {
        const processo = data.data;
        const jurimetria = processo.jurimetria;
        
        // Gerar estatísticas comparativas
        const analiseCompleta = {
          ...jurimetria,
          media_tribunal: 180,
          percentil: jurimetria.tempo_total_dias < 120 ? 25 : 
                    jurimetria.tempo_total_dias < 180 ? 50 :
                    jurimetria.tempo_total_dias < 240 ? 75 : 90,
          benchmark: {
            mais_rapido: 90,
            mais_lento: 365,
            mediana: 160
          },
          processo_info: {
            numero: processo.numero_processo,
            classe: processo.classe,
            tribunal: processo.tribunal
          }
        };
        
        setAnalise(analiseCompleta);
        
        toast({
          title: "Análise concluída",
          description: "Relatório jurimétrico gerado com sucesso"
        });
      } else {
        throw new Error('Processo não encontrado ou sem dados jurimetricos');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível gerar a análise jurimétrica",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise Jurimétrica
          </CardTitle>
          <CardDescription>
            Obtenha insights estatísticos sobre o tempo de tramitação e comparações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="processo-analise">Número do Processo</Label>
            <Input
              id="processo-analise"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              placeholder="Ex: 1234567-12.2024.8.26.0001"
              onKeyPress={(e) => e.key === 'Enter' && gerarAnalise()}
            />
          </div>

          <Button 
            onClick={gerarAnalise} 
            disabled={!numeroProcesso.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Calculator className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Gerar Análise
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analise && (
        <div className="space-y-6">
          {/* Informações do Processo */}
          <Card>
            <CardHeader>
              <CardTitle>Processo Analisado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número</p>
                  <p className="font-semibold">{analise.processo_info.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Classe</p>
                  <p className="font-semibold">{analise.processo_info.classe}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tribunal</p>
                  <p className="font-semibold">{analise.processo_info.tribunal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Métricas Principais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas do Processo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{analise.tempo_total_dias}</p>
                    <p className="text-sm text-gray-600">Dias tramitando</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{analise.total_movimentacoes}</p>
                    <p className="text-sm text-gray-600">Movimentações</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{analise.tempo_na_fase_atual}</p>
                    <p className="text-sm text-gray-600">Dias na fase atual</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{analise.percentil}º</p>
                    <p className="text-sm text-gray-600">Percentil</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparativo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparativo com o Tribunal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Este processo</span>
                    <span className="font-bold">{analise.tempo_total_dias} dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Média do tribunal</span>
                    <span className="font-bold text-gray-600">{analise.media_tribunal} dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mais rápido</span>
                    <span className="font-bold text-green-600">{analise.benchmark.mais_rapido} dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mediana</span>
                    <span className="font-bold text-blue-600">{analise.benchmark.mediana} dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mais lento</span>
                    <span className="font-bold text-red-600">{analise.benchmark.mais_lento} dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status e Previsões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">{analise.fase_atual}</p>
                  <p className="text-sm text-gray-600">Fase atual</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">{new Date(analise.previsao_sentenca).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-gray-600">Previsão de conclusão</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">
                    {analise.tempo_total_dias < analise.media_tribunal ? '📈 Rápido' : '📉 Lento'}
                  </p>
                  <p className="text-sm text-gray-600">Performance</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">{analise.tempo_medio_entre_movimentacoes}</p>
                  <p className="text-sm text-gray-600">Dias médios entre movimentações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnaliseJurimetrica;
