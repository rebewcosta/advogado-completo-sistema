
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calculator, TrendingUp } from 'lucide-react';

interface CorrecaoResult {
  valorOriginal: number;
  valorCorrigido: number;
  variacao: number;
  percentual: number;
  indice: string;
  dataInicial: string;
  dataFinal: string;
}

export const CalculadoraCorrecao: React.FC = () => {
  const { toast } = useToast();
  const [valor, setValor] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [indice, setIndice] = useState('');
  const [resultado, setResultado] = useState<CorrecaoResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const indices = [
    { value: 'ipca', label: 'IPCA - Índice de Preços ao Consumidor Amplo' },
    { value: 'igpm', label: 'IGP-M - Índice Geral de Preços do Mercado' },
    { value: 'inpc', label: 'INPC - Índice Nacional de Preços ao Consumidor' },
    { value: 'selic', label: 'SELIC - Taxa Básica de Juros' },
    { value: 'tr', label: 'TR - Taxa Referencial' },
  ];

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    return formattedValue;
  };

  const calcularCorrecao = async () => {
    if (!valor || !dataInicial || !dataFinal || !indice) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, digite um valor válido.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Simulação de cálculo (em produção, usaria API do Banco Central)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de cálculo baseado no período e índice
      const diasCorreção = Math.floor((new Date(dataFinal).getTime() - new Date(dataInicial).getTime()) / (1000 * 60 * 60 * 24));
      let taxaAnual = 0;
      
      switch (indice) {
        case 'ipca':
          taxaAnual = 4.5; // Simulação IPCA
          break;
        case 'igpm':
          taxaAnual = 5.2; // Simulação IGP-M
          break;
        case 'inpc':
          taxaAnual = 4.1; // Simulação INPC
          break;
        case 'selic':
          taxaAnual = 10.75; // Simulação SELIC
          break;
        case 'tr':
          taxaAnual = 1.2; // Simulação TR
          break;
        default:
          taxaAnual = 4.5;
      }

      const taxaDiaria = taxaAnual / 365;
      const fatorCorrecao = Math.pow(1 + (taxaDiaria / 100), diasCorreção);
      const valorCorrigido = valorNumerico * fatorCorrecao;
      const variacao = valorCorrigido - valorNumerico;
      const percentual = ((valorCorrigido / valorNumerico) - 1) * 100;

      setResultado({
        valorOriginal: valorNumerico,
        valorCorrigido,
        variacao,
        percentual,
        indice: indices.find(i => i.value === indice)?.label || '',
        dataInicial,
        dataFinal
      });

      toast({
        title: "Cálculo realizado",
        description: "Correção monetária calculada com sucesso!",
      });

    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular a correção. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Correção Monetária
        </CardTitle>
        <CardDescription>
          Calcule correção monetária usando índices oficiais (IPCA, SELIC, IGP-M, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="valor">Valor Original *</Label>
            <Input
              id="valor"
              type="text"
              value={valor}
              onChange={(e) => setValor(formatCurrency(e.target.value))}
              placeholder="R$ 0,00"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="indice">Índice de Correção *</Label>
            <Select value={indice} onValueChange={setIndice}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o índice" />
              </SelectTrigger>
              <SelectContent>
                {indices.map((idx) => (
                  <SelectItem key={idx.value} value={idx.value}>
                    {idx.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dataInicial">Data Inicial *</Label>
            <Input
              id="dataInicial"
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="dataFinal">Data Final *</Label>
            <Input
              id="dataFinal"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Button 
          onClick={calcularCorrecao} 
          disabled={isCalculating}
          className="w-full"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {isCalculating ? 'Calculando...' : 'Calcular Correção'}
        </Button>

        {resultado && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Resultado da Correção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Valor Original:</span>
                <p className="text-gray-900">{resultado.valorOriginal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Valor Corrigido:</span>
                <p className="text-gray-900 font-semibold text-green-700">{resultado.valorCorrigido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Variação:</span>
                <p className="text-gray-900">{resultado.variacao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Percentual:</span>
                <p className="text-gray-900">{resultado.percentual.toFixed(4)}%</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Índice:</span>
                <p className="text-gray-900">{resultado.indice}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Período:</span>
                <p className="text-gray-900">{new Date(resultado.dataInicial).toLocaleDateString('pt-BR')} a {new Date(resultado.dataFinal).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <strong>Aviso:</strong> Este cálculo é uma simulação baseada em dados estimados. 
                Para cálculos oficiais, consulte sempre as fontes oficiais do Banco Central.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
