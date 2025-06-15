
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
      setCalculos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cálculos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calcularPrazo = () => {
    if (!calculoSelecionado || !dataInicio) return;

    const calculo = calculos.find(c => c.id === calculoSelecionado);
    if (!calculo) return;

    const dataBase = new Date(dataInicio);
    let dataFinal: Date;

    if (calculo.considera_fins_semana) {
      // Usando addBusinessDays para pular fins de semana
      dataFinal = addBusinessDays(dataBase, calculo.dias_prazo);
    } else {
      // Adicionando dias corridos
      dataFinal = addDays(dataBase, calculo.dias_prazo);
    }

    setResultado(dataFinal);
  };

  const salvarNovoCalculo = async () => {
    if (!novoCalculo.nome || !novoCalculo.tipo || !user) return;

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
              />
            </div>

            <div>
              <Label htmlFor="tipo-calculo">Tipo de Prazo</Label>
              <Select value={calculoSelecionado} onValueChange={setCalculoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de prazo" />
                </SelectTrigger>
                <SelectContent>
                  {calculos.map((calculo) => (
                    <SelectItem key={calculo.id} value={calculo.id}>
                      {calculo.nome_calculo} ({calculo.dias_prazo} dias)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={calcularPrazo} className="w-full" disabled={!calculoSelecionado || !dataInicio}>
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
                <CardTitle>Tipos de Prazo</CardTitle>
                <CardDescription>
                  Gerencie seus cálculos personalizados
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
                  />
                </div>

                <div>
                  <Label htmlFor="tipo-prazo">Tipo</Label>
                  <Input
                    id="tipo-prazo"
                    value={novoCalculo.tipo}
                    onChange={(e) => setNovoCalculo(prev => ({ ...prev, tipo: e.target.value }))}
                    placeholder="Ex: contestacao"
                  />
                </div>

                <div>
                  <Label htmlFor="dias-prazo">Dias do Prazo</Label>
                  <Input
                    id="dias-prazo"
                    type="number"
                    value={novoCalculo.dias}
                    onChange={(e) => setNovoCalculo(prev => ({ ...prev, dias: parseInt(e.target.value) || 15 }))}
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
              {calculos.map((calculo) => (
                <div key={calculo.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{calculo.nome_calculo}</div>
                    <div className="text-sm text-gray-500">{calculo.dias_prazo} dias</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {calculo.considera_fins_semana ? 'Úteis' : 'Corridos'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
