
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Spinner } from '@/components/ui/spinner';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import ProcessSearchActionBar from '@/components/processos/ProcessSearchActionBar';
import ProcessListAsCards from '@/components/processos/ProcessListAsCards';
import MeusProcessosTable from '@/components/processos/MeusProcessosTable';
import ProcessDialogs from '@/components/processos/ProcessDialogs';
import EscavadorImportDialog from '@/components/processos/EscavadorImportDialog';
import { useProcessesPage } from '@/hooks/useProcessesPage';

const MeusProcessosPage = () => {
  const {
    searchTerm,
    formDialogOpen,
    detailsDialogOpen,
    selectedProcess,
    processoParaForm,
    isEditing,
    userClients,
    isLoadingClients,
    filteredProcesses,
    isLoadingCombined,
    processes,
    escavadorDialogOpen,
    handleSearchChange,
    handleOpenNewProcessForm,
    handleSaveProcess,
    handleEditProcess,
    handleViewProcess,
    handleToggleStatus,
    handleDeleteProcess,
    handleManualRefresh,
    handleOpenEscavadorImport,
    handleEscavadorImportComplete,
    setFormDialogOpen,
    setDetailsDialogOpen,
    setProcessoParaForm,
    setIsEditing,
    setSelectedProcess,
    setEscavadorDialogOpen,
    getProcessById,
    fetchUserClients
  } = useProcessesPage();

  if (isLoadingCombined && !processes.length) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full flex flex-col justify-center items-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <Spinner size="lg" className="text-blue-500" />
            <span className="text-gray-700 mt-4 block font-medium">Carregando processos...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
        <div className="animate-fade-in">
          <SharedPageHeader
            title="Meus Processos"
            description="Gerencie e acompanhe todos os seus processos jurídicos com ferramentas modernas e eficientes."
            pageIcon={<FileText className="text-blue-500" />}
            showActionButton={false}
            isLoading={isLoadingCombined}
          />
          
          {/* Informação sobre importação automática */}
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Importação Inteligente de Processos</p>
                  <p>
                    Você pode importar automaticamente todos os seus processos do Escavador de uma só vez, <strong>1 vez por mês</strong>. 
                    Após usar a importação automática, continue adicionando processos <strong>ilimitadamente</strong> usando o botão 
                    "Novo Processo" para cadastro manual.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProcessSearchActionBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddProcess={handleOpenNewProcessForm}
          onRefresh={handleManualRefresh}
          onImportFromOAB={handleOpenEscavadorImport}
          isLoading={isLoadingCombined}
        />
        
        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block animate-fade-in">
          <MeusProcessosTable
            processes={filteredProcesses}
            onEdit={handleEditProcess}
            onView={handleViewProcess}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteProcess}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          />
        </div>
        <div className="md:hidden animate-fade-in">
          <ProcessListAsCards
            processes={filteredProcesses}
            onEdit={handleEditProcess}
            onView={handleViewProcess}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteProcess}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          />
        </div>

        <ProcessDialogs
          formDialogOpen={formDialogOpen}
          detailsDialogOpen={detailsDialogOpen}
          selectedProcess={detailsDialogOpen ? selectedProcess : processoParaForm}
          isEditing={isEditing}
          onFormDialogOpenChange={(open) => {
            if (!open) { setProcessoParaForm(null); setIsEditing(false); }
            setFormDialogOpen(open);
          }}
          onDetailsDialogOpenChange={(open) => {
            if (!open) { setSelectedProcess(null); }
            setDetailsDialogOpen(open);
          }}
          onSaveProcess={handleSaveProcess}
          onEditProcess={(id) => { 
            const processToEdit = getProcessById(id); 
            if (processToEdit) handleEditProcess(processToEdit);
          }}
          clientesDoUsuario={userClients}
          isLoadingClientes={isLoadingClients}
          onClienteAdded={fetchUserClients}
        />

        <EscavadorImportDialog
          open={escavadorDialogOpen}
          onOpenChange={setEscavadorDialogOpen}
          onImportComplete={handleEscavadorImportComplete}
        />
      </div>
    </AdminLayout>
  );
};

export default MeusProcessosPage;
