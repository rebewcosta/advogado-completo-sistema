
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ResultadosLista from './ResultadosLista';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BuscaAvancada: React.FC = () => {
  const [tipoBusca, setTipoBusca] = useState('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [tribunal, setTribunal] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [ultimaBusca, setUltimaBusca] = useState<string>('');
  const { toast } = useToast();

  const tribunais = [
    { value: 'todos', label: 'Principais tribunais (TJSP, TJRJ)' },
    { value: 'TJSP', label: 'TJSP - Tribunal de Justiça de São Paulo' },
    { value: 'TJRJ', label: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
    { value: 'TJMG', label: 'TJMG - Tribunal de Justiça de Minas Gerais' },
    { value: 'TJRS', label: 'TJRS - Tribunal de Justiça do Rio Grande do Sul' },
    { value: 'TJPR', label: 'TJPR - Tribunal de Justiça do Paraná' },
    { value: 'TJSC', label: 'TJSC - Tribunal de Justiça de Santa Catarina' },
    { value: 'TJBA', label: 'TJBA - Tribunal de Justiça da Bahia' },
    { value: 'TJGO', label: 'TJGO - Tribunal de Justiça de Goiás' },
    { value: 'TJDF', label: 'TJDF - Tribunal de Justiça do Distrito Federal' },
    { value: 'TST', label: 'TST - Tribunal Superior do Trabalho' },
    { value: 'STJ', label: 'STJ - Superior Tribunal de Justiça' }
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
    setResultados([]);
    setUltimaBusca(termoBusca.trim());

    try {
      console.log('Iniciando busca:', { tipo: tipoBusca, termo: termoBusca.trim(), tribunal });

      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: tipoBusca,
          termo: termoBusca.trim(),
          tribunal: tribunal === 'todos' ? undefined : tribunal
        }
      });

      console.log('Resposta da função:', data);

      if (error) {
        console.error('Erro na chamada da função:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      if (data.success) {
        if (data.data) {
          const resultadosArray = Array.isArray(data.data) ? data.data : [data.data];
          setResultados(resultadosArray);
          
          toast({
            title: "Busca concluída",
            description: `${resultadosArray.length} resultado(s) encontrado(s) em ${data.tribunais_consultados?.join(', ') || 'tribunais consultados'}`
          });
        } else {
          setResultados([]);
          toast({
            title: "Nenhum resultado encontrado",
            description: data.message || "Não foram encontrados processos para os critérios informados"
          });
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido na busca');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Não foi possível realizar a busca",
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
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta busca consulta a API oficial do CNJ DataJud. Para obter melhores resultados, 
          use termos exatos conforme constam nos processos.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            Busca Avançada por Partes
          </CardTitle>
          <CardDescription>
            Encontre processos pelo nome ou documento das partes envolvidas na base oficial do CNJ
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
              <Label htmlFor="tribunal">Tribunal</Label>
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
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleBusca()}
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
                Consultando CNJ DataJud...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar na Base Oficial CNJ
              </>
            )}
          </Button>
          
          {ultimaBusca && (
            <p className="text-sm text-muted-foreground">
              Última busca: "{ultimaBusca}"
            </p>
          )}
        </CardContent>
      </Card>

      {resultados.length > 0 && (
        <ResultadosLista resultados={resultados} />
      )}
    </div>
  );
};

export default BuscaAvancada;
