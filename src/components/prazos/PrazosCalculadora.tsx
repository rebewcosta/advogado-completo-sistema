
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
import { Calculator, Calendar, Plus, Save, Edit, Trash2, AlertCircle } from 'lucide-react';
import { format, addDays, isWeekend, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [editandoCalculo, setEditandoCalculo] = useState<PrazoCalculo | null>(null);
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
      dataFinal = addBusinessDays(dataBase, diasPrazo);
    } else {
      dataFinal = addDays(dataBase, diasPrazo);
    }

    setResultado(dataFinal);
    
    toast({
      title: "Prazo calculado",
      description: `Data final: ${format(dataFinal, "dd/MM/yyyy")}`,
    });
  };

  const salvarCalculo = async () => {
    if (!novoCalculo.nome || !novoCalculo.tipo || !user) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editandoCalculo) {
        // Atualizar cálculo existente
        const { error } = await supabase
          .from('prazo_calculos')
          .update({
            nome_calculo: novoCalculo.nome,
            tipo_prazo: novoCalculo.tipo,
            dias_prazo: novoCalculo.dias,
            considera_feriados: novoCalculo.consideraFeriados,
            considera_fins_semana: novoCalculo.consideraFinsSemana,
            observacoes: novoCalculo.observacoes
          })
          .eq('id', editandoCalculo.id);

        if (error) throw error;

        toast({
          title: "Cálculo atualizado",
          description: "Cálculo de prazo atualizado com sucesso!",
        });
      } else {
        // Criar novo cálculo
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
      }

      resetFormulario();
      fetchCalculos();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cálculo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editarCalculo = (calculo: PrazoCalculo) => {
    setEditandoCalculo(calculo);
    setNovoCalculo({
      nome: calculo.nome_calculo,
      tipo: calculo.tipo_prazo,
      dias: calculo.dias_prazo,
      consideraFeriados: calculo.considera_feriados,
      consideraFinsSemana: calculo.considera_fins_semana,
      observacoes: calculo.observacoes || ''
    });
    setMostrarFormulario(true);
  };

  const excluirCalculo = async (calculoId: string) => {
    try {
      const { error } = await supabase
        .from('prazo_calculos')
        .update({ ativo: false })
        .eq('id', calculoId);

      if (error) throw error;

      toast({
        title: "Cálculo excluído",
        description: "Cálculo de prazo excluído com sucesso!",
      });

      fetchCalculos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cálculo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetFormulario = () => {
    setNovoCalculo({
      nome: '',
      tipo: '',
      dias: 15,
      consideraFeriados: true,
      consideraFinsSemana: true,
      observacoes: ''
    });
    setMostrarFormulario(false);
    setEditandoCalculo(null);
  };

  const tiposDisponiveis = usandoPadrao ? TIPOS_PRAZO_PADRAO : calculos;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculadora */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
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
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <p className="text-xs text-amber-600">
                    Usando tipos padrão. Crie tipos personalizados ao lado →
                  </p>
                </div>
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

        {/* Tipos Personalizados */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  Tipos de Prazo Personalizados
                </CardTitle>
                <CardDescription>
                  Crie seus próprios cálculos de prazo
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  resetFormulario();
                  setMostrarFormulario(!mostrarFormulario);
                }}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mostrarFormulario && (
              <div className="space-y-4 p-4 border-2 border-dashed border-green-200 rounded-lg mb-4 bg-green-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-800">
                    {editandoCalculo ? 'Editar Cálculo' : 'Novo Cálculo'}
                  </h4>
                  {editandoCalculo && (
                    <Button variant="ghost" size="sm" onClick={resetFormulario}>
                      Cancelar Edição
                    </Button>
                  )}
                </div>

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
                  <Button onClick={salvarCalculo} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {editandoCalculo ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetFormulario}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {usandoPadrao ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhum tipo personalizado criado ainda.</p>
                  <p className="text-xs">Clique em "Novo" para criar seu primeiro tipo de prazo.</p>
                </div>
              ) : (
                calculos.map((calculo) => (
                  <div key={calculo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{calculo.nome_calculo}</div>
                      <div className="text-sm text-gray-500">
                        {calculo.dias_prazo} dias • {calculo.considera_fins_semana ? 'Úteis' : 'Corridos'}
                      </div>
                      {calculo.observacoes && (
                        <div className="text-xs text-gray-400 mt-1">{calculo.observacoes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editarCalculo(calculo)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Cálculo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o cálculo "{calculo.nome_calculo}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => excluirCalculo(calculo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
