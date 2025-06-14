
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertCircle, Info, Clock, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DataJudPageContent: React.FC = () => {
  const [searchType, setSearchType] = useState('numero');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [tribunal, setTribunal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const tribunais = [
    { value: 'tjsp', label: 'TJ-SP - São Paulo' },
    { value: 'tjrj', label: 'TJ-RJ - Rio de Janeiro' },
    { value: 'tjmg', label: 'TJ-MG - Minas Gerais' },
    { value: 'tjrs', label: 'TJ-RS - Rio Grande do Sul' },
    { value: 'tjpr', label: 'TJ-PR - Paraná' },
    { value: 'tjsc', label: 'TJ-SC - Santa Catarina' },
    { value: 'tjce', label: 'TJ-CE - Ceará' },
    { value: 'tjba', label: 'TJ-BA - Bahia' },
    { value: 'tjpe', label: 'TJ-PE - Pernambuco' },
    { value: 'tjgo', label: 'TJ-GO - Goiás' }
  ];

  const handleSearch = async () => {
    if (!numeroProcesso || !tribunal) {
      return;
    }

    setIsLoading(true);
    try {
      // Aqui implementaremos a chamada para a edge function do DataJud
      console.log('Buscando:', { numeroProcesso, tribunal, searchType });
      
      // Simulação de resultado por enquanto
      setTimeout(() => {
        setResults([
          {
            numeroProcesso: numeroProcesso,
            classe: 'Procedimento Comum Cível',
            assunto: 'Responsabilidade Civil',
            dataAjuizamento: '2024-01-15',
            orgaoJulgador: '1ª Vara Cível',
            status: 'Em andamento',
            movimentacoes: [
              { data: '2024-01-15', descricao: 'Distribuição' },
              { data: '2024-01-20', descricao: 'Citação' },
              { data: '2024-02-05', descricao: 'Contestação' }
            ]
          }
        ]);
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro na consulta:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações sobre a API */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>API Oficial CNJ:</strong> Esta página utiliza a API pública do DataJud do Conselho Nacional de Justiça. 
          Os dados são oficiais e gratuitos, com limite de 120 consultas por minuto.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="busca" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="busca">Consultar Processos</TabsTrigger>
          <TabsTrigger value="info">Informações da API</TabsTrigger>
        </TabsList>

        <TabsContent value="busca" className="space-y-6">
          {/* Formulário de Busca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Consulta DataJud CNJ
              </CardTitle>
              <CardDescription>
                Busque informações oficiais de processos judiciais através da API pública do CNJ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="tipo-busca">Tipo de Busca</Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numero">Número do Processo</SelectItem>
                      <SelectItem value="nome">Nome da Parte</SelectItem>
                      <SelectItem value="oab">Número OAB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero-processo">
                  {searchType === 'numero' ? 'Número do Processo' : 
                   searchType === 'nome' ? 'Nome da Parte' : 'Número OAB'}
                </Label>
                <Input
                  id="numero-processo"
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                  placeholder={
                    searchType === 'numero' ? 'Ex: 1234567-12.2024.8.26.0001' :
                    searchType === 'nome' ? 'Ex: João da Silva' : 'Ex: 123456'
                  }
                />
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={!numeroProcesso || !tribunal || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Consultando API CNJ...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Consultar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resultados da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((processo, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{processo.numeroProcesso}</Badge>
                      <Badge>{processo.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Classe:</strong> {processo.classe}
                      </div>
                      <div>
                        <strong>Assunto:</strong> {processo.assunto}
                      </div>
                      <div>
                        <strong>Data Ajuizamento:</strong> {processo.dataAjuizamento}
                      </div>
                      <div>
                        <strong>Órgão Julgador:</strong> {processo.orgaoJulgador}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Últimas Movimentações:</h4>
                      <div className="space-y-1">
                        {processo.movimentacoes.map((mov: any, i: number) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="text-gray-500">{mov.data}</span>
                            <span>{mov.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a API DataJud CNJ</CardTitle>
              <CardDescription>
                Informações técnicas sobre a API oficial do Conselho Nacional de Justiça
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Vantagens</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Dados oficiais do CNJ</li>
                    <li>• Acesso gratuito</li>
                    <li>• Cobertura nacional</li>
                    <li>• Metadados estruturados</li>
                    <li>• Histórico de movimentações</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Limitações</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 120 consultas por minuto</li>
                    <li>• Foco em metadados</li>
                    <li>• Não inclui textos completos</li>
                    <li>• Depende do envio pelos tribunais</li>
                    <li>• Consultas via Elasticsearch</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta API é ideal para consultas pontuais e pesquisas acadêmicas. Para monitoramento 
                  em tempo real ou grande volume de consultas, considere APIs comerciais especializadas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataJudPageContent;
