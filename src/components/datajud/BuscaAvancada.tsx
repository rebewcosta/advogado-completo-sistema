
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
    
    // Tribunais Superiores
    { value: 'STJ', label: 'STJ - Superior Tribunal de Justiça' },
    { value: 'TST', label: 'TST - Tribunal Superior do Trabalho' },
    { value: 'TSE', label: 'TSE - Tribunal Superior Eleitoral' },
    { value: 'STM', label: 'STM - Superior Tribunal Militar' },
    
    // Justiça Federal
    { value: 'TRF1', label: 'TRF1 - Tribunal Regional Federal da 1ª Região' },
    { value: 'TRF2', label: 'TRF2 - Tribunal Regional Federal da 2ª Região' },
    { value: 'TRF3', label: 'TRF3 - Tribunal Regional Federal da 3ª Região' },
    { value: 'TRF4', label: 'TRF4 - Tribunal Regional Federal da 4ª Região' },
    { value: 'TRF5', label: 'TRF5 - Tribunal Regional Federal da 5ª Região' },
    { value: 'TRF6', label: 'TRF6 - Tribunal Regional Federal da 6ª Região' },
    
    // Justiça Estadual
    { value: 'TJAC', label: 'TJAC - Tribunal de Justiça do Acre' },
    { value: 'TJAL', label: 'TJAL - Tribunal de Justiça de Alagoas' },
    { value: 'TJAP', label: 'TJAP - Tribunal de Justiça do Amapá' },
    { value: 'TJAM', label: 'TJAM - Tribunal de Justiça do Amazonas' },
    { value: 'TJBA', label: 'TJBA - Tribunal de Justiça da Bahia' },
    { value: 'TJCE', label: 'TJCE - Tribunal de Justiça do Ceará' },
    { value: 'TJDF', label: 'TJDF - Tribunal de Justiça do Distrito Federal' },
    { value: 'TJES', label: 'TJES - Tribunal de Justiça do Espírito Santo' },
    { value: 'TJGO', label: 'TJGO - Tribunal de Justiça de Goiás' },
    { value: 'TJMA', label: 'TJMA - Tribunal de Justiça do Maranhão' },
    { value: 'TJMT', label: 'TJMT - Tribunal de Justiça de Mato Grosso' },
    { value: 'TJMS', label: 'TJMS - Tribunal de Justiça de Mato Grosso do Sul' },
    { value: 'TJMG', label: 'TJMG - Tribunal de Justiça de Minas Gerais' },
    { value: 'TJPA', label: 'TJPA - Tribunal de Justiça do Pará' },
    { value: 'TJPB', label: 'TJPB - Tribunal de Justiça da Paraíba' },
    { value: 'TJPR', label: 'TJPR - Tribunal de Justiça do Paraná' },
    { value: 'TJPE', label: 'TJPE - Tribunal de Justiça de Pernambuco' },
    { value: 'TJPI', label: 'TJPI - Tribunal de Justiça do Piauí' },
    { value: 'TJRJ', label: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
    { value: 'TJRN', label: 'TJRN - Tribunal de Justiça do Rio Grande do Norte' },
    { value: 'TJRS', label: 'TJRS - Tribunal de Justiça do Rio Grande do Sul' },
    { value: 'TJRO', label: 'TJRO - Tribunal de Justiça de Rondônia' },
    { value: 'TJRR', label: 'TJRR - Tribunal de Justiça de Roraima' },
    { value: 'TJSC', label: 'TJSC - Tribunal de Justiça de Santa Catarina' },
    { value: 'TJSP', label: 'TJSP - Tribunal de Justiça de São Paulo' },
    { value: 'TJSE', label: 'TJSE - Tribunal de Justiça de Sergipe' },
    { value: 'TJTO', label: 'TJTO - Tribunal de Justiça do Tocantins' },
    
    // Justiça do Trabalho
    { value: 'TRT1', label: 'TRT1 - Tribunal Regional do Trabalho da 1ª Região (RJ)' },
    { value: 'TRT2', label: 'TRT2 - Tribunal Regional do Trabalho da 2ª Região (SP)' },
    { value: 'TRT3', label: 'TRT3 - Tribunal Regional do Trabalho da 3ª Região (MG)' },
    { value: 'TRT4', label: 'TRT4 - Tribunal Regional do Trabalho da 4ª Região (RS)' },
    { value: 'TRT5', label: 'TRT5 - Tribunal Regional do Trabalho da 5ª Região (BA)' },
    { value: 'TRT6', label: 'TRT6 - Tribunal Regional do Trabalho da 6ª Região (PE)' },
    { value: 'TRT7', label: 'TRT7 - Tribunal Regional do Trabalho da 7ª Região (CE)' },
    { value: 'TRT8', label: 'TRT8 - Tribunal Regional do Trabalho da 8ª Região (PA/AP)' },
    { value: 'TRT9', label: 'TRT9 - Tribunal Regional do Trabalho da 9ª Região (PR)' },
    { value: 'TRT10', label: 'TRT10 - Tribunal Regional do Trabalho da 10ª Região (DF/TO)' },
    { value: 'TRT11', label: 'TRT11 - Tribunal Regional do Trabalho da 11ª Região (AM/RR)' },
    { value: 'TRT12', label: 'TRT12 - Tribunal Regional do Trabalho da 12ª Região (SC)' },
    { value: 'TRT13', label: 'TRT13 - Tribunal Regional do Trabalho da 13ª Região (PB)' },
    { value: 'TRT14', label: 'TRT14 - Tribunal Regional do Trabalho da 14ª Região (RO/AC)' },
    { value: 'TRT15', label: 'TRT15 - Tribunal Regional do Trabalho da 15ª Região (SP Interior)' },
    { value: 'TRT16', label: 'TRT16 - Tribunal Regional do Trabalho da 16ª Região (MA)' },
    { value: 'TRT17', label: 'TRT17 - Tribunal Regional do Trabalho da 17ª Região (ES)' },
    { value: 'TRT18', label: 'TRT18 - Tribunal Regional do Trabalho da 18ª Região (GO)' },
    { value: 'TRT19', label: 'TRT19 - Tribunal Regional do Trabalho da 19ª Região (AL)' },
    { value: 'TRT20', label: 'TRT20 - Tribunal Regional do Trabalho da 20ª Região (SE)' },
    { value: 'TRT21', label: 'TRT21 - Tribunal Regional do Trabalho da 21ª Região (RN)' },
    { value: 'TRT22', label: 'TRT22 - Tribunal Regional do Trabalho da 22ª Região (PI)' },
    { value: 'TRT23', label: 'TRT23 - Tribunal Regional do Trabalho da 23ª Região (MT)' },
    { value: 'TRT24', label: 'TRT24 - Tribunal Regional do Trabalho da 24ª Região (MS)' }
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
