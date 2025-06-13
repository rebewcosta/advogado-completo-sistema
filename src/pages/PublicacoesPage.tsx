
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, 
  Settings, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  FileText, 
  Calendar,
  MapPin,
  Shield,
  Filter,
  RefreshCw,
  ExternalLink,
  Bell,
  BookOpen
} from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Spinner } from '@/components/ui/spinner';

interface Publicacao {
  id: string;
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
  segredo_justica: boolean;
  lida: boolean;
  importante: boolean;
  observacoes?: string;
  created_at: string;
}

interface ConfiguracaoMonitoramento {
  id: string;
  nomes_monitoramento: string[];
  estados_monitoramento: string[];
  palavras_chave: string[];
  monitoramento_ativo: boolean;
  ultima_busca?: string;
}

const estados = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

const PublicacoesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMonitoramento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroLida, setFiltroLida] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  // Estados para configuração
  const [nomesMonitoramento, setNomesMonitoramento] = useState<string[]>(['']);
  const [estadosMonitoramento, setEstadosMonitoramento] = useState<string[]>([]);
  const [palavrasChave, setPalavrasChave] = useState<string[]>(['']);
  const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(true);

  const fetchPublicacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('publicacoes_diario_oficial')
        .select('*')
        .eq('user_id', user.id)
        .order('data_publicacao', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublicacoes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar publicações",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const fetchConfiguracao = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('configuracoes_monitoramento')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguracao(data);
        setNomesMonitoramento(data.nomes_monitoramento.length > 0 ? data.nomes_monitoramento : ['']);
        setEstadosMonitoramento(data.estados_monitoramento || []);
        setPalavrasChave(data.palavras_chave.length > 0 ? data.palavras_chave : ['']);
        setMonitoramentoAtivo(data.monitoramento_ativo);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user, toast]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPublicacoes(), fetchConfiguracao()]);
      setIsLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user, fetchPublicacoes, fetchConfiguracao]);

  const toggleLida = async (publicacaoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ lida: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPublicacoes(prev => prev.map(p => 
        p.id === publicacaoId ? { ...p, lida: !currentStatus } : p
      ));
      
      toast({
        title: !currentStatus ? "Marcada como lida" : "Marcada como não lida",
        description: "Status atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleImportante = async (publicacaoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('publicacoes_diario_oficial')
        .update({ importante: !currentStatus })
        .eq('id', publicacaoId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPublicacoes(prev => prev.map(p => 
        p.id === publicacaoId ? { ...p, importante: !currentStatus } : p
      ));
      
      toast({
        title: !currentStatus ? "Marcada como importante" : "Removida dos importantes",
        description: "Status atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar importância",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const salvarConfiguracao = async () => {
    if (!user) return;
    
    try {
      const nomesFiltrados = nomesMonitoramento.filter(n => n.trim() !== '');
      const palavrasFiltradas = palavrasChave.filter(p => p.trim() !== '');
      
      const configData = {
        user_id: user.id,
        nomes_monitoramento: nomesFiltrados,
        estados_monitoramento: estadosMonitoramento,
        palavras_chave: palavrasFiltradas,
        monitoramento_ativo: monitoramentoAtivo
      };

      const { error } = await supabase
        .from('configuracoes_monitoramento')
        .upsert(configData);

      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de monitoramento foram atualizadas"
      });
      
      setShowConfigDialog(false);
      await fetchConfiguracao();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const publicacoesFiltradas = publicacoes.filter(pub => {
    const matchesSearch = pub.titulo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.conteudo_publicacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.nome_advogado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !filtroEstado || pub.estado === filtroEstado;
    const matchesTipo = !filtroTipo || pub.tipo_publicacao === filtroTipo;
    const matchesLida = !filtroLida || 
                       (filtroLida === 'lida' && pub.lida) ||
                       (filtroLida === 'nao-lida' && !pub.lida);
    
    return matchesSearch && matchesEstado && matchesTipo && matchesLida;
  });

  const totalNaoLidas = publicacoes.filter(p => !p.lida).length;
  const totalImportantes = publicacoes.filter(p => p.importante).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <SharedPageHeader
        title="Monitoramento de Publicações"
        description="Acompanhe suas publicações nos diários oficiais do Brasil"
        pageIcon={<BookOpen />}
        showActionButton={false}
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Publicações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicacoes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalNaoLidas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importantes</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalImportantes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoramento</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {configuracao?.monitoramento_ativo ? (
                <Badge variant="default" className="bg-green-100 text-green-700">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Ações
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={fetchPublicacoes} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configurações de Monitoramento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="monitoramento-ativo"
                        checked={monitoramentoAtivo}
                        onCheckedChange={setMonitoramentoAtivo}
                      />
                      <Label htmlFor="monitoramento-ativo">Monitoramento ativo</Label>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Nomes para monitoramento</Label>
                      <div className="space-y-2 mt-2">
                        {nomesMonitoramento.map((nome, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={nome}
                              onChange={(e) => {
                                const novosNomes = [...nomesMonitoramento];
                                novosNomes[index] = e.target.value;
                                setNomesMonitoramento(novosNomes);
                              }}
                              placeholder="Nome do advogado"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (nomesMonitoramento.length > 1) {
                                  setNomesMonitoramento(nomesMonitoramento.filter((_, i) => i !== index));
                                }
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNomesMonitoramento([...nomesMonitoramento, ''])}
                        >
                          Adicionar Nome
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Estados para monitorar (vazio = todos)</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                        {estados.map(estado => (
                          <div key={estado.uf} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={estado.uf}
                              checked={estadosMonitoramento.includes(estado.uf)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEstadosMonitoramento([...estadosMonitoramento, estado.uf]);
                                } else {
                                  setEstadosMonitoramento(estadosMonitoramento.filter(uf => uf !== estado.uf));
                                }
                              }}
                            />
                            <Label htmlFor={estado.uf} className="text-sm">{estado.uf}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Palavras-chave adicionais</Label>
                      <div className="space-y-2 mt-2">
                        {palavrasChave.map((palavra, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={palavra}
                              onChange={(e) => {
                                const novasPalavras = [...palavrasChave];
                                novasPalavras[index] = e.target.value;
                                setPalavrasChave(novasPalavras);
                              }}
                              placeholder="Palavra-chave"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (palavrasChave.length > 1) {
                                  setPalavrasChave(palavrasChave.filter((_, i) => i !== index));
                                }
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPalavrasChave([...palavrasChave, ''])}
                        >
                          Adicionar Palavra
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={salvarConfiguracao}>
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar publicações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os estados</SelectItem>
                {estados.map(estado => (
                  <SelectItem key={estado.uf} value={estado.uf}>
                    {estado.uf} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de publicação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="Citação">Citação</SelectItem>
                <SelectItem value="Intimação">Intimação</SelectItem>
                <SelectItem value="Sentença">Sentença</SelectItem>
                <SelectItem value="Despacho">Despacho</SelectItem>
                <SelectItem value="Decisão">Decisão</SelectItem>
                <SelectItem value="Edital">Edital</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroLida} onValueChange={setFiltroLida}>
              <SelectTrigger>
                <SelectValue placeholder="Status de leitura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="lida">Lidas</SelectItem>
                <SelectItem value="nao-lida">Não lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Publicações */}
      <Card>
        <CardHeader>
          <CardTitle>Publicações Encontradas ({publicacoesFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {publicacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma publicação encontrada</p>
              <p className="text-sm mt-2">Configure o monitoramento para começar a receber publicações</p>
            </div>
          ) : (
            <div className="space-y-4">
              {publicacoesFiltradas.map((publicacao) => (
                <Card key={publicacao.id} className={`${!publicacao.lida ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{publicacao.titulo_publicacao}</h3>
                          {publicacao.segredo_justica && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                              <Shield className="h-3 w-3 mr-1" />
                              Segredo
                            </Badge>
                          )}
                          {publicacao.importante && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              <Star className="h-3 w-3 mr-1" />
                              Importante
                            </Badge>
                          )}
                          {!publicacao.lida && (
                            <Badge className="bg-red-100 text-red-700">Nova</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(publicacao.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {publicacao.estado} {publicacao.comarca && `- ${publicacao.comarca}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {publicacao.tipo_publicacao || 'Não especificado'}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Diário:</strong> {publicacao.diario_oficial}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Advogado:</strong> {publicacao.nome_advogado}
                        </p>
                        
                        {publicacao.numero_processo && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Processo:</strong> {publicacao.numero_processo}
                          </p>
                        )}
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">{publicacao.conteudo_publicacao}</p>
                        </div>
                        
                        {publicacao.observacoes && (
                          <div className="mt-2 bg-yellow-50 p-2 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <strong>Observações:</strong> {publicacao.observacoes}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleLida(publicacao.id, publicacao.lida)}
                        >
                          {publicacao.lida ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Marcar não lida
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Marcar como lida
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleImportante(publicacao.id, publicacao.importante)}
                        >
                          {publicacao.importante ? (
                            <>
                              <StarOff className="h-4 w-4 mr-1" />
                              Remover importante
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-1" />
                              Marcar importante
                            </>
                          )}
                        </Button>
                        
                        {publicacao.url_publicacao && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(publicacao.url_publicacao, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver original
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicacoesPage;
