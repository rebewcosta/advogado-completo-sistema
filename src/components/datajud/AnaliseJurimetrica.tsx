
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, BarChart3, Clock, Calculator } from 'lucide-react';

const AnaliseJurimetrica: React.FC = () => {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [analise, setAnalise] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const gerarAnalise = async () => {
    if (!numeroProcesso.trim()) return;

    setIsLoading(true);
    // Simular análise
    setTimeout(() => {
      setAnalise({
        tempo_total: 145,
        movimentacoes: 8,
        fase_atual: 'Instrução',
        tempo_fase: 35,
        media_tribunal: 180,
        percentil: 75,
        previsao_conclusao: '2024-08-15',
        benchmark: {
          mais_rapido: 90,
          mais_lento: 365,
          mediana: 160
        }
      });
      setIsLoading(false);
    }, 2000);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métricas Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{analise.tempo_total}</p>
                  <p className="text-sm text-gray-600">Dias tramitando</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{analise.movimentacoes}</p>
                  <p className="text-sm text-gray-600">Movimentações</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{analise.tempo_fase}</p>
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
                  <span className="font-bold">{analise.tempo_total} dias</span>
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

          {/* Status Atual */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status e Previsões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">{analise.fase_atual}</p>
                  <p className="text-sm text-gray-600">Fase atual</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">{new Date(analise.previsao_conclusao).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-gray-600">Previsão de conclusão</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-semibold">
                    {analise.tempo_total < analise.media_tribunal ? '📈 Rápido' : '📉 Lento'}
                  </p>
                  <p className="text-sm text-gray-600">Performance</p>
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
