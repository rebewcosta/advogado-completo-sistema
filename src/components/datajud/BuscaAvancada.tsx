
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ResultadosLista from './ResultadosLista';

const BuscaAvancada: React.FC = () => {
  const [tipoBusca, setTipoBusca] = useState('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [tribunal, setTribunal] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const { toast } = useToast();

  const tribunais = [
    { value: 'todos', label: 'Todos os tribunais' },
    { value: 'TJSP', label: 'TJ-SP - São Paulo' },
    { value: 'TJRJ', label: 'TJ-RJ - Rio de Janeiro' },
    { value: 'TJMG', label: 'TJ-MG - Minas Gerais' },
    { value: 'TJRS', label: 'TJ-RS - Rio Grande do Sul' },
    { value: 'TJPR', label: 'TJ-PR - Paraná' },
    { value: 'TJSC', label: 'TJ-SC - Santa Catarina' }
  ];

  const handleBusca = async () => {
    if (!termoBusca.trim()) {
      toast({
        title: "Erro",
        description: "Digite o termo para busca",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: tipoBusca,
          termo: termoBusca.trim(),
          tribunal: tribunal === 'todos' ? undefined : tribunal
        }
      });

      if (error) throw error;

      if (data.success) {
        const resultadosArray = Array.isArray(data.data) ? data.data : [data.data];
        setResultados(resultadosArray);
        
        toast({
          title: "Busca concluída",
          description: `${resultadosArray.length} resultado(s) encontrado(s)`
        });
      } else {
        throw new Error(data.error || 'Erro na busca');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive"
      });
      setResultados([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (tipoBusca) {
      case 'nome':
        return 'Ex: João da Silva Santos';
      case 'documento':
        return 'Ex: 123.456.789-00 ou 12.345.678/0001-90';
      default:
        return 'Digite o termo para busca';
    }
  };

  const getIcon = () => {
    switch (tipoBusca) {
      case 'nome':
        return <User className="h-5 w-5" />;
      case 'documento':
        return <FileText className="h-5 w-5" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            Busca Avançada por Partes
          </CardTitle>
          <CardDescription>
            Encontre processos pelo nome ou documento das partes envolvidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-busca">Tipo de Busca</Label>
              <Select value={tipoBusca} onValueChange={setTipoBusca}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome da Parte</SelectItem>
                  <SelectItem value="documento">CPF/CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tribunal">Tribunal (Opcional)</Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent>
                  {tribunais.map((trib) => (
                    <SelectItem key={trib.value} value={trib.value}>
                      {trib.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="termo-busca">Termo de Busca</Label>
            <Input
              id="termo-busca"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder={getPlaceholder()}
              onKeyPress={(e) => e.key === 'Enter' && handleBusca()}
            />
          </div>

          <Button 
            onClick={handleBusca} 
            disabled={!termoBusca.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Processos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resultados.length > 0 && (
        <ResultadosLista resultados={resultados} />
      )}
    </div>
  );
};

export default BuscaAvancada;
