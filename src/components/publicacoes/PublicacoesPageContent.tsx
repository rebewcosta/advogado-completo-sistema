
import React, { useState } from 'react';
import { usePublicacoesData } from '@/hooks/usePublicacoesData';
import { useConfiguracao } from '@/hooks/useConfiguracao';
import { usePublicacoesFiltros } from '@/hooks/usePublicacoesFiltros';
import { Spinner } from '@/components/ui/spinner';
import PublicacoesStats from '@/components/publicacoes/PublicacoesStats';
import PublicacoesFilters from '@/components/publicacoes/PublicacoesFilters';
import ConfiguracaoDialog from '@/components/publicacoes/ConfiguracaoDialog';
import PublicacoesList from '@/components/publicacoes/PublicacoesList';
import MonitoramentoManual from '@/components/publicacoes/MonitoramentoManual';

const PublicacoesPageContent: React.FC = () => {
  const {
    publicacoes,
    isLoading,
    fetchPublicacoes,
    toggleLida,
    toggleImportante
  } = usePublicacoesData();

  const {
    configuracao,
    nomesMonitoramento,
    setNomesMonitoramento,
    estadosMonitoramento,
    setEstadosMonitoramento,
    palavrasChave,
    setPalavrasChave,
    numerosOAB,
    setNumerosOAB,
    nomesEscritorio,
    setNomesEscritorio,
    monitoramentoAtivo,
    setMonitoramentoAtivo,
    salvarConfiguracao
  } = useConfiguracao();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const { publicacoesParaExibir } = usePublicacoesFiltros(
    publicacoes,
    configuracao,
    searchTerm,
    statusFilter
  );

  const handleSalvarConfiguracao = async () => {
    await salvarConfiguracao();
    setShowConfigDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3 block">Carregando publicações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-4 md:p-6 lg:p-8">
        <PublicacoesStats publicacoes={publicacoesParaExibir} configuracao={configuracao} />

        <div className="space-y-6 mb-6">
          <div className="w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
            <PublicacoesFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onRefresh={fetchPublicacoes}
              onOpenConfig={() => setShowConfigDialog(true)}
              isLoading={isLoading}
            />
          </div>
          
          <div className="w-full animate-fade-in" style={{ animationDelay: '400ms' }}>
            <MonitoramentoManual 
              configuracao={configuracao}
              onMonitoramentoCompleto={fetchPublicacoes}
            />
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <PublicacoesList
            publicacoes={publicacoesParaExibir}
            onToggleLida={toggleLida}
            onToggleImportante={toggleImportante}
          />
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
          onSave={handleSalvarConfiguracao}
        />
      </div>
    </div>
  );
};

export default PublicacoesPageContent;
