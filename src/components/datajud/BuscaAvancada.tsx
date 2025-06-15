import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, User, FileText, AlertCircle, CheckCircle, Info, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ResultadosLista from './ResultadosLista';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const BuscaAvancada: React.FC = () => {
  const [tipoBusca, setTipoBusca] = useState('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [tribunal, setTribunal] = useState('principais');
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [ultimaBusca, setUltimaBusca] = useState<string>('');
  const [dadosConsulta, setDadosConsulta] = useState<any>(null);
  const { toast } = useToast();

  const tribunais = [
    { value: 'principais', label: 'Principais tribunais (TJSP, TJRJ, TJMG)' },
    { value: 'todos', label: 'Todos os tribunais disponíveis' },
    
    // Tribunais de Justiça Estaduais (principais em destaque)
    { value: 'TJSP', label: '⭐ TJSP - Tribunal de Justiça de São Paulo' },
    { value: 'TJRJ', label: '⭐ TJRJ - Tribunal de Justiça do Rio de Janeiro' },
    { value: 'TJMG', label: '⭐ TJMG - Tribunal de Justiça de Minas Gerais' },
    { value: 'TJRS', label: '⭐ TJRS - Tribunal de Justiça do Rio Grande do Sul' },
    { value: 'TJPR', label: '⭐ TJPR - Tribunal de Justiça do Paraná' },
    
    // Tribunais de Justiça Estaduais (ordem alfabética, removendo duplicatas)
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
    { value: 'TJPA', label: 'TJPA - Tribunal de Justiça do Pará' },
    { value: 'TJPB', label: 'TJPB - Tribunal de Justiça da Paraíba' },
    { value: 'TJPE', label: 'TJPE - Tribunal de Justiça de Pernambuco' },
    { value: 'TJPI', label: 'TJPI - Tribunal de Justiça do Piauí' },
    { value: 'TJRN', label: 'TJRN - Tribunal de Justiça do Rio Grande do Norte' },
    { value: 'TJRO', label: 'TJRO - Tribunal de Justiça de Rondônia' },
    { value: 'TJRR', label: 'TJRR - Tribunal de Justiça de Roraima' },
    { value: 'TJSC', label: 'TJSC - Tribunal de Justiça de Santa Catarina' },
    { value: 'TJSE', label: 'TJSE - Tribunal de Justiça de Sergipe' },
    { value: 'TJTO', label: 'TJTO - Tribunal de Justiça do Tocantins' },
    
    // Tribunais Regionais do Trabalho
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
    { value: 'TRT15', label: 'TRT15 - Tribunal Regional do Trabalho da 15ª Região (SP)' },
    { value: 'TRT16', label: 'TRT16 - Tribunal Regional do Trabalho da 16ª Região (MA)' },
    { value: 'TRT17', label: 'TRT17 - Tribunal Regional do Trabalho da 17ª Região (ES)' },
    { value: 'TRT18', label: 'TRT18 - Tribunal Regional do Trabalho da 18ª Região (GO)' },
    { value: 'TRT19', label: 'TRT19 - Tribunal Regional do Trabalho da 19ª Região (AL)' },
    { value: 'TRT20', label: 'TRT20 - Tribunal Regional do Trabalho da 20ª Região (SE)' },
    { value: 'TRT21', label: 'TRT21 - Tribunal Regional do Trabalho da 21ª Região (RN)' },
    { value: 'TRT22', label: 'TRT22 - Tribunal Regional do Trabalho da 22ª Região (PI)' },
    { value: 'TRT23', label: 'TRT23 - Tribunal Regional do Trabalho da 23ª Região (MT)' },
    { value: 'TRT24', label: 'TRT24 - Tribunal Regional do Trabalho da 24ª Região (MS)' },
    
    // Tribunais Regionais Federais
    { value: 'TRF1', label: 'TRF1 - Tribunal Regional Federal da 1ª Região' },
    { value: 'TRF2', label: 'TRF2 - Tribunal Regional Federal da 2ª Região' },
    { value: 'TRF3', label: 'TRF3 - Tribunal Regional Federal da 3ª Região' },
    { value: 'TRF4', label: 'TRF4 - Tribunal Regional Federal da 4ª Região' },
    { value: 'TRF5', label: 'TRF5 - Tribunal Regional Federal da 5ª Região' },
    { value: 'TRF6', label: 'TRF6 - Tribunal Regional Federal da 6ª Região' },
    
    // Tribunais Superiores
    { value: 'TST', label: 'TST - Tribunal Superior do Trabalho' },
    { value: 'STJ', label: 'STJ - Superior Tribunal de Justiça' },
    { value: 'STF', label: 'STF - Supremo Tribunal Federal' },
    { value: 'TSE', label: 'TSE - Tribunal Superior Eleitoral' },
    { value: 'STM', label: 'STM - Superior Tribunal Militar' },
    
    // Tribunais Regionais Eleitorais
    { value: 'TREAC', label: 'TRE-AC - Tribunal Regional Eleitoral do Acre' },
    { value: 'TREAL', label: 'TRE-AL - Tribunal Regional Eleitoral de Alagoas' },
    { value: 'TREAP', label: 'TRE-AP - Tribunal Regional Eleitoral do Amapá' },
    { value: 'TREAM', label: 'TRE-AM - Tribunal Regional Eleitoral do Amazonas' },
    { value: 'TREBA', label: 'TRE-BA - Tribunal Regional Eleitoral da Bahia' },
    { value: 'TRECE', label: 'TRE-CE - Tribunal Regional Eleitoral do Ceará' },
    { value: 'TREDF', label: 'TRE-DF - Tribunal Regional Eleitoral do Distrito Federal' },
    { value: 'TREES', label: 'TRE-ES - Tribunal Regional Eleitoral do Espírito Santo' },
    { value: 'TREGO', label: 'TRE-GO - Tribunal Regional Eleitoral de Goiás' },
    { value: 'TREMA', label: 'TRE-MA - Tribunal Regional Eleitoral do Maranhão' },
    { value: 'TREMT', label: 'TRE-MT - Tribunal Regional Eleitoral de Mato Grosso' },
    { value: 'TREMS', label: 'TRE-MS - Tribunal Regional Eleitoral de Mato Grosso do Sul' },
    { value: 'TREMG', label: 'TRE-MG - Tribunal Regional Eleitoral de Minas Gerais' },
    { value: 'TREPA', label: 'TRE-PA - Tribunal Regional Eleitoral do Pará' },
    { value: 'TREPB', label: 'TRE-PB - Tribunal Regional Eleitoral da Paraíba' },
    { value: 'TREPR', label: 'TRE-PR - Tribunal Regional Eleitoral do Paraná' },
    { value: 'TREPE', label: 'TRE-PE - Tribunal Regional Eleitoral de Pernambuco' },
    { value: 'TREPI', label: 'TRE-PI - Tribunal Regional Eleitoral do Piauí' },
    { value: 'TRERJ', label: 'TRE-RJ - Tribunal Regional Eleitoral do Rio de Janeiro' },
    { value: 'TRERN', label: 'TRE-RN - Tribunal Regional Eleitoral do Rio Grande do Norte' },
    { value: 'TRERS', label: 'TRE-RS - Tribunal Regional Eleitoral do Rio Grande do Sul' },
    { value: 'TRERO', label: 'TRE-RO - Tribunal Regional Eleitoral de Rondônia' },
    { value: 'TRERR', label: 'TRE-RR - Tribunal Regional Eleitoral de Roraima' },
    { value: 'TRESC', label: 'TRE-SC - Tribunal Regional Eleitoral de Santa Catarina' },
    { value: 'TRESP', label: 'TRE-SP - Tribunal Regional Eleitoral de São Paulo' },
    { value: 'TRESE', label: 'TRE-SE - Tribunal Regional Eleitoral de Sergipe' },
    { value: 'TRETO', label: 'TRE-TO - Tribunal Regional Eleitoral do Tocantins' },
    
    // Tribunais de Justiça Militar
    { value: 'TJMSP', label: 'TJM-SP - Tribunal de Justiça Militar de São Paulo' },
    { value: 'TJMRJ', label: 'TJM-RJ - Tribunal de Justiça Militar do Rio de Janeiro' },
    { value: 'TJMRS', label: 'TJM-RS - Tribunal de Justiça Militar do Rio Grande do Sul' },
    { value: 'TJMMG', label: 'TJM-MG - Tribunal de Justiça Militar de Minas Gerais' },
    
    // Outros Tribunais
    { value: 'TSTM', label: 'TSTM - Tribunal Superior do Trabalho Militar' },
    { value: 'CSJT', label: 'CSJT - Conselho Superior da Justiça do Trabalho' },
    { value: 'CNJ', label: 'CNJ - Conselho Nacional de Justiça' }
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

    // Validações específicas por tipo
    if (tipoBusca === 'documento') {
      const docLimpo = termoBusca.replace(/\D/g, '');
      if (docLimpo.length !== 11 && docLimpo.length !== 14) {
        toast({
          title: "Erro",
          description: "CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos",
          variant: "destructive"
        });
        return;
      }
    }

    if (tipoBusca === 'numero') {
      const numLimpo = termoBusca.replace(/\D/g, '');
      if (numLimpo.length < 15) {
        toast({
          title: "Atenção",
          description: "Número do processo pode estar incompleto. Para melhores resultados, use o número completo com 20 dígitos."
        });
      }
    }

    setIsLoading(true);
    setResultados([]);
    setUltimaBusca(termoBusca.trim());
    setDadosConsulta(null);

    try {
      console.log('Iniciando busca:', { tipo: tipoBusca, termo: termoBusca.trim(), tribunal });

      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('consultar-datajud', {
        body: {
          tipo: tipoBusca,
          termo: termoBusca.trim(),
          tribunal: tribunal
        }
      });

      const endTime = Date.now();
      const tempoConsulta = ((endTime - startTime) / 1000).toFixed(2);

      console.log('Resposta da função:', data);

      if (data && data.success) {
        setDadosConsulta({
          tribunais_consultados: data.tribunais_consultados || [],
          total_encontrados: data.total_encontrados || 0,
          fonte: data.fonte || 'api_cnj',
          tempo_consulta: tempoConsulta,
          cache_timestamp: data.cache_timestamp
        });

        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setResultados(data.data);
          
          const fonteMsg = data.fonte === 'cache' ? '(resultado do cache)' : '(consulta em tempo real)';
          
          toast({
            title: "Busca concluída",
            description: `${data.data.length} resultado(s) encontrado(s) em ${tempoConsulta}s ${fonteMsg}`
          });
        } else {
          setResultados([]);
          toast({
            title: "Nenhum resultado encontrado",
            description: data.message || "Não foram encontrados processos para os critérios informados"
          });
        }
      } else {
        throw new Error(data?.error || 'Erro desconhecido na busca');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      
      toast({
        title: "Erro na busca",
        description: error instanceof Error ? error.message : "Não foi possível realizar a busca",
        variant: "destructive"
      });
      setResultados([]);
      setDadosConsulta(null);
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
      case 'numero':
        return 'Ex: 1234567-89.2023.8.26.0001';
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
      case 'numero':
        return <Search className="h-5 w-5" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  const getTipoBuscaHelp = () => {
    switch (tipoBusca) {
      case 'nome':
        return "Digite o nome completo da pessoa física ou razão social da empresa. A busca é inteligente e aceita variações.";
      case 'documento':
        return "Digite o CPF (11 dígitos) ou CNPJ (14 dígitos). Pode incluir ou não a formatação (pontos, hífen, barra).";
      case 'numero':
        return "Digite o número do processo judicial. Funciona melhor com o número completo de 20 dígitos, mas aceita formatos parciais.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta busca consulta a API oficial do CNJ DataJud em tempo real. Os resultados são oficiais e 
          atualizados conforme a base de dados do Conselho Nacional de Justiça.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            Busca Avançada DataJud CNJ
          </CardTitle>
          <CardDescription>
            Encontre processos na base oficial do CNJ por nome das partes, CPF/CNPJ ou número do processo
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
                  <SelectItem value="numero">Número do Processo</SelectItem>
                </SelectContent>
              </Select>
              {getTipoBuscaHelp() && (
                <p className="text-xs text-muted-foreground">{getTipoBuscaHelp()}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tribunal">Tribunal</Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
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
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Última busca: "{ultimaBusca}"</span>
              {dadosConsulta && (
                <div className="flex items-center gap-2">
                  {dadosConsulta.fonte === 'cache' ? (
                    <Badge variant="secondary" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      Cache
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Tempo real
                    </Badge>
                  )}
                  <span className="text-xs">{dadosConsulta.tempo_consulta}s</span>
                </div>
              )}
            </div>
          )}

          {dadosConsulta && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Tribunais consultados:</strong> {dadosConsulta.tribunais_consultados.join(', ')}</p>
                  <p><strong>Total encontrado:</strong> {dadosConsulta.total_encontrados} processo(s)</p>
                  <p><strong>Fonte:</strong> {dadosConsulta.fonte === 'cache' ? 'Cache (dados previamente consultados)' : 'API CNJ em tempo real'}</p>
                  {dadosConsulta.cache_timestamp && (
                    <p><strong>Última atualização:</strong> {new Date(dadosConsulta.cache_timestamp).toLocaleString('pt-BR')}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
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
