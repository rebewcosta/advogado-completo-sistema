
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Search, Loader2 } from 'lucide-react';

interface Feriado {
  date: string;
  name: string;
  type: string;
}

export const ConsultaFeriados: React.FC = () => {
  const { toast } = useToast();
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const consultarFeriados = async () => {
    if (!ano || parseInt(ano) < 2020 || parseInt(ano) > 2030) {
      toast({
        title: "Ano inválido",
        description: "Por favor, digite um ano entre 2020 e 2030.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
      
      if (!response.ok) {
        throw new Error('Erro na consulta');
      }
      
      const data = await response.json();
      setFeriados(data);
      
      toast({
        title: "Feriados carregados",
        description: `${data.length} feriados encontrados para ${ano}!`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Não foi possível consultar os feriados. Tente novamente.",
        variant: "destructive",
      });
      setFeriados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'national':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'state':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'municipal':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'national':
        return 'Nacional';
      case 'state':
        return 'Estadual';
      case 'municipal':
        return 'Municipal';
      default:
        return 'Outro';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Consulta de Feriados Nacionais
        </CardTitle>
        <CardDescription>
          Consulte feriados nacionais para cálculo correto de prazos processuais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="ano">Ano</Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && consultarFeriados()}
              placeholder="2024"
              min="2020"
              max="2030"
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={consultarFeriados} 
              disabled={isLoading || !ano}
              className="h-10"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Consultar
            </Button>
          </div>
        </div>

        {feriados.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">
              Feriados Nacionais de {ano} ({feriados.length} feriados)
            </h3>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {feriados.map((feriado, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{feriado.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {formatDate(feriado.date)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(feriado.type)}`}>
                      {getTypeName(feriado.type)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Estes feriados devem ser considerados na contagem de prazos processuais. 
                Lembre-se de verificar também feriados estaduais e municipais específicos da sua região.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
