
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Spinner } from '@/components/ui/spinner';
import PublicacoesStats from '@/components/publicacoes/PublicacoesStats';
import PublicacoesFilters from '@/components/publicacoes/PublicacoesFilters';
import ConfiguracaoDialog from '@/components/publicacoes/ConfiguracaoDialog';
import PublicacoesList from '@/components/publicacoes/PublicacoesList';
import MonitoramentoManual from '@/components/publicacoes/MonitoramentoManual';

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
  numeros_oab: string[];
  nomes_escritorio: string[];
  monitoramento_ativo: boolean;
  ultima_busca?: string;
}

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
  const [numerosOAB, setNumerosOAB] = useState<string[]>(['']);
  const [nomesEscritorio, setNomesEscritorio] = useState<string[]>(['']);
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
        setNumerosOAB(data.numeros_oab?.length > 0 ? data.numeros_oab : ['']);
        setNomesEscritorio(data.nomes_escritorio?.length > 0 ? data.nomes_escritorio : ['']);
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
      const numerosFiltrados = numerosOAB.filter(n => n.trim() !== '');
      const escritoriosFiltrados = nomesEscritorio.filter(n => n.trim() !== '');
      
      const configData = {
        user_id: user.id,
        nomes_monitoramento: nomesFiltrados,
        estados_monitoramento: estadosMonitoramento,
        palavras_chave: palavrasFiltradas,
        numeros_oab: numerosFiltrados,
        nomes_escritorio: escritoriosFiltrados,
        monitoramento_ativo: monitoramentoAtivo
      };

      if (configuracao) {
        const { error } = await supabase
          .from('configuracoes_monitoramento')
          .update(configData)
          .eq('id', configuracao.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_monitoramento')
          .insert(configData);

        if (error) throw error;
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações de monitoramento foram atualizadas com os novos filtros de precisão"
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
    
    const matchesEstado = !filtroEstado || filtroEstado === 'todos' || pub.estado === filtroEstado;
    const matchesTipo = !filtroTipo || filtroTipo === 'todos' || pub.tipo_publicacao === filtroTipo;
    const matchesLida = !filtroLida || filtroLida === 'todas' ||
                       (filtroLida === 'lida' && pub.lida) ||
                       (filtroLida === 'nao-lida' && !pub.lida);
    
    return matchesSearch && matchesEstado && matchesTipo && matchesLida;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 md:p-4 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Monitoramento de Publicações"
          description="Acompanhe suas publicações nos diários oficiais do Brasil"
          pageIcon={<BookOpen />}
          showActionButton={false}
        />

        <PublicacoesStats publicacoes={publicacoes} configuracao={configuracao} />

        <div className="space-y-4 mb-4">
          <div className="w-full">
            <PublicacoesFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              filtroTipo={filtroTipo}
              setFiltroTipo={setFiltroTipo}
              filtroLida={filtroLida}
              setFiltroLida={setFiltroLida}
              onRefresh={fetchPublicacoes}
              onOpenConfig={() => setShowConfigDialog(true)}
            />
          </div>
          
          <div className="w-full">
            <MonitoramentoManual 
              configuracao={configuracao}
              onMonitoramentoCompleto={fetchPublicacoes}
            />
          </div>
        </div>

        <ConfiguracaoDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          nomesMonitoramento={nomesMonitoramento}
          setNomesMonitoramento={setNomesMonitoramento}
          estadosMonitoramento={estadosMonitoramento}
          setEstadosMonitoramento={setEstadosMonitoramento}
          palavrasChave={palavrasChave}
          setPalavrasChave={setPalavrasChave}
          numerosOAB={numerosOAB}
          setNumerosOAB={setNumerosOAB}
          nomesEscritorio={nomesEscritorio}
          setNomesEscritorio={setNomesEscritorio}
          monitoramentoAtivo={monitoramentoAtivo}
          setMonitoramentoAtivo={setMonitoramentoAtivo}
          onSave={salvarConfiguracao}
        />

        <PublicacoesList
          publicacoes={publicacoesFiltradas}
          onToggleLida={toggleLida}
          onToggleImportante={toggleImportante}
        />
      </div>
    </div>
  );
};

export default PublicacoesPage;
