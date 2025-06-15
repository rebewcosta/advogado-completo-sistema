
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Calendar, ExternalLink } from 'lucide-react';
import { format, addDays, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface PrazoCalculo {
  id: string;
  nome_calculo: string;
  tipo_prazo: string;
  dias_prazo: number;
  considera_feriados: boolean;
  considera_fins_semana: boolean;
}

export const PrazosCalculadoraWidget: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculos, setCalculos] = useState<PrazoCalculo[]>([]);
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calculoSelecionado, setCalculoSelecionado] = useState<string>('');
  const [resultado, setResultado] = useState<Date | null>(null);

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
        .order('nome_calculo')
        .limit(10);

      if (error) throw error;
      setCalculos(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cálculos:', error);
    }
  };

  const calcularPrazo = () => {
    if (!calculoSelecionado || !dataInicio) return;

    const calculo = calculos.find(c => c.id === calculoSelecionado);
    if (!calculo) return;

    const dataBase = new Date(dataInicio);
    let dataFinal: Date;

    if (calculo.considera_fins_semana) {
      dataFinal = addBusinessDays(dataBase, calculo.dias_prazo);
    } else {
      dataFinal = addDays(dataBase, calculo.dias_prazo);
    }

    setResultado(dataFinal);
    
    toast({
      title: "Prazo calculado",
      description: `Data final: ${format(dataFinal, "dd/MM/yyyy", { locale: ptBR })}`,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-blue-500"/>
            Calculadora de Prazos
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/prazos?tab=calculadora">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="data-inicio-widget" className="text-xs">Data de Início</Label>
            <Input
              id="data-inicio-widget"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="tipo-calculo-widget" className="text-xs">Tipo de Prazo</Label>
            <Select value={calculoSelecionado} onValueChange={setCalculoSelecionado}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecione o prazo" />
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
        </div>

        <Button 
          onClick={calcularPrazo} 
          className="w-full" 
          size="sm"
          disabled={!calculoSelecionado || !dataInicio}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calcular
        </Button>

        {resultado && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-sm">Data Final:</span>
            </div>
            <div className="text-sm font-bold text-green-800 mt-1">
              {format(resultado, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {format(resultado, "dd/MM/yyyy")}
            </div>
          </div>
        )}

        {calculos.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-2">Nenhum cálculo configurado</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/prazos?tab=calculadora">
                Configurar Prazos
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
