
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Calendar, Plus, Save } from 'lucide-react';
import { format, addDays, isWeekend, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrazoCalculo {
  id: string;
  nome_calculo: string;
  tipo_prazo: string;
  dias_prazo: number;
  considera_feriados: boolean;
  considera_fins_semana: boolean;
  observacoes: string;
}

// Tipos de prazo padrão
const TIPOS_PRAZO_PADRAO = [
  { id: 'contestacao-15', nome: 'Contestação - 15 dias', dias: 15, consideraFinsSemana: true },
  { id: 'contestacao-30', nome: 'Contestação - 30 dias', dias: 30, consideraFinsSemana: true },
  { id: 'recurso-15', nome: 'Recurso - 15 dias', dias: 15, consideraFinsSemana: true },
  { id: 'recurso-8', nome: 'Recurso - 8 dias', dias: 8, consideraFinsSemana: true },
  { id: 'embargos-5', nome: 'Embargos de Declaração - 5 dias', dias: 5, consideraFinsSemana: true },
  { id: 'peticionamento-5', nome: 'Peticionamento Geral - 5 dias', dias: 5, consideraFinsSemana: true },
  { id: 'cumprimento-15', nome: 'Cumprimento de Sentença - 15 dias', dias: 15, consideraFinsSemana: true },
];

export const PrazosCalculadora: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculos, setCalculos] = useState<PrazoCalculo[]>([]);
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calculoSelecionado, setCalculoSelecionado] = useState<string>('');
  const [resultado, setResultado] = useState<Date | null>(null);
  const [novoCalculo, setNovoCalculo] = useState({
    nome: '',
    tipo: '',
    dias: 15,
    consideraFeriados: true,
    consideraFinsSemana: true,
    observacoes: ''
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usandoPadrao, setUsandoPadrao] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCalculos();
    }
  }, [user]);

  const fetchCalculos = async () => {
    try {
      const { data, error } = await supabase
        .from('prazo_calculos')
        .select('*')
        .eq('user_id', user?.id)
        .eq('ativo', true)
        .order('nome_calculo');

      if (error) throw error;
      
      // Se não há cálculos personalizados, usar os padrão
      if (!data || data.length === 0) {
        setUsandoPadrao(true);
        setCalculos([]);
      } else {
        setUsandoPadrao(false);
        setCalculos(data);
      }
    } catch (error: any) {
      console.log("Erro ao carregar cálculos personalizados, usando padrão:", error.message);
      setUsandoPadrao(true);
      setCalculos([]);
    }
  };

  const calcularPrazo = () => {
    if (!calculoSelecionado || !dataInicio) return;

    let diasPrazo: number;
    let consideraFinsSemana: boolean;

    if (usandoPadrao) {
      const tipoPadrao = TIPOS_PRAZO_PADRAO.find(t => t.id === calculoSelecionado);
      if (!tipoPadrao) return;
      diasPrazo = tipoPadrao.dias;
      consideraFinsSemana = tipoPadrao.consideraFinsSemana;
    } else {
      const calculo = calculos.find(c => c.id === calculoSelecionado);
      if (!calculo) return;
      diasPrazo = calculo.dias_prazo;
      consideraFinsSemana = calculo.considera_fins_semana;
    }

    const dataBase = new Date(dataInicio);
    let dataFinal: Date;

    if (consideraFinsSemana) {
      // Usando addBusinessDays para pular fins de semana
      dataFinal = addBusinessDays(dataBase, diasPrazo);
    } else {
      // Adicionando dias corridos
      dataFinal = addDays(dataBase, diasPrazo);
    }

    setResultado(dataFinal);
    
    toast({
      title: "Prazo calculado",
      description: `Data final: ${format(dataFinal, "dd/MM/yyyy")}`,
    });
  };

  const salvarNovoCalculo = async () => {
    if (!novoCalculo.nome || !novoCalculo.tipo || !user) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('prazo_calculos')
        .insert({
          user_id: user.id,
          nome_calculo: novoCalculo.nome,
          tipo_prazo: novoCalculo.tipo,
          dias_prazo: novoCalculo.dias,
          considera_feriados: novoCalculo.consideraFeriados,
          considera_fins_semana: novoCalculo.consideraFinsSemana,
          observacoes: novoCalculo.observacoes
        });

      if (error) throw error;

      toast({
        title: "Cálculo salvo",
        description: "Novo cálculo de prazo criado com sucesso!",
      });

      setNovoCalculo({
        nome: '',
        tipo: '',
        dias: 15,
        consideraFeriados: true,
        consideraFinsSemana: true,
        observacoes: ''
      });
      setMostrarFormulario(false);
      fetchCalculos();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cálculo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const tiposDisponiveis = usandoPadrao ? TIPOS_PRAZO_PADRAO : calculos;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculadora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora de Prazos
            </CardTitle>
            <CardDescription>
              Calcule prazos processuais automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="data-inicio">Data de Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tipo-calculo">Tipo de Prazo</Label>
              <Select value={calculoSelecionado} onValueChange={setCalculoSelecionado}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de prazo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDisponiveis.map((item) => (
                    <SelectItem 
                      key={usandoPadrao ? item.id : item.id} 
                      value={usandoPadrao ? item.id : item.id}
                    >
                      {usandoPadrao ? `${item.nome} (${item.dias} dias)` : `${item.nome_calculo} (${item.dias_prazo} dias)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {usandoPadrao && (
                <p className="text-xs text-gray-500 mt-1">
                  Usando tipos de prazo padrão. Crie tipos personalizados ao lado.
                </p>
              )}
            </div>

            <Button 
              onClick={calcularPrazo} 
              className="w-full" 
              disabled={!calculoSelecionado || !dataInicio}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Prazo
            </Button>

            {resultado && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Data Final:</span>
                </div>
                <div className="text-lg font-bold text-green-800 mt-1">
                  {format(resultado, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {format(resultado, "dd/MM/yyyy")}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gerenciar Cálculos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tipos de Prazo Personalizados</CardTitle>
                <CardDescription>
                  Crie seus próprios cálculos de prazo
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mostrarFormulario && (
              <div className="space-y-4 p-4 border rounded-lg mb-4">
                <div>
                  <Label htmlFor="nome-calculo">Nome do Cálculo</Label>
                  <Input
                    id="nome-calculo"
                    value={novoCalculo.nome}
                    onChange={(e) => setNovoCalculo(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Contestação Trabalhista"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tipo-prazo">Tipo</Label>
                  <Input
                    id="tipo-prazo"
                    value={novoCalculo.tipo}
                    onChange={(e) => setNovoCalculo(prev => ({ ...prev, tipo: e.target.value }))}
                    placeholder="Ex: contestacao"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dias-prazo">Dias do Prazo</Label>
                  <Input
                    id="dias-prazo"
                    type="number"
                    value={novoCalculo.dias}
                    onChange={(e) => setNovoCalculo(prev => ({ ...prev, dias: parseInt(e.target.value) || 15 }))}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="considera-fins-semana"
                      checked={novoCalculo.consideraFinsSemana}
                      onCheckedChange={(checked) => 
                        setNovoCalculo(prev => ({ ...prev, consideraFinsSemana: checked as boolean }))
                      }
                    />
                    <Label htmlFor="considera-fins-semana">Considera fins de semana</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="considera-feriados"
                      checked={novoCalculo.consideraFeriados}
                      onCheckedChange={(checked) => 
                        setNovoCalculo(prev => ({ ...prev, consideraFeriados: checked as boolean }))
                      }
                    />
                    <Label htmlFor="considera-feriados">Considera feriados</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={salvarNovoCalculo} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMostrarFormulario(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {usandoPadrao ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">Nenhum tipo personalizado criado ainda.</p>
                  <p className="text-xs">Clique em "Novo" para criar seu primeiro tipo de prazo.</p>
                </div>
              ) : (
                calculos.map((calculo) => (
                  <div key={calculo.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{calculo.nome_calculo}</div>
                      <div className="text-sm text-gray-500">{calculo.dias_prazo} dias</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {calculo.considera_fins_semana ? 'Úteis' : 'Corridos'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
