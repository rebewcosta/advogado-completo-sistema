
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import AdminLayout from '@/components/AdminLayout';
import { Spinner } from '@/components/ui/spinner';
import { FileText } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import ProcessSearchActionBar from '@/components/processos/ProcessSearchActionBar';
import ProcessListAsCards from '@/components/processos/ProcessListAsCards';
import MeusProcessosTable from '@/components/processos/MeusProcessosTable';
import ProcessDialogs from '@/components/processos/ProcessDialogs';
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
    handleSearchChange,
    handleOpenNewProcessForm,
    handleSaveProcess,
    handleEditProcess,
    handleViewProcess,
    handleToggleStatus,
    handleDeleteProcess,
    handleManualRefresh,
    setFormDialogOpen,
    setDetailsDialogOpen,
    setProcessoParaForm,
    setIsEditing,
    setSelectedProcess,
    getProcessById,
    fetchUserClients
  } = useProcessesPage();

  if (isLoadingCombined && !processes.length) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 overflow-auto min-w-0">
            <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full flex flex-col justify-center items-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                <Spinner size="lg" className="text-blue-500" />
                <span className="text-gray-700 mt-4 block font-medium">Carregando processos...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 overflow-auto min-w-0">
          <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
            <div className="animate-fade-in">
              <SharedPageHeader
                title="Meus Processos"
                description="Gerencie e acompanhe todos os seus processos jurídicos com ferramentas modernas e eficientes."
                pageIcon={<FileText className="text-blue-500" />}
                showActionButton={false}
                isLoading={isLoadingCombined}
              />
            </div>

            <ProcessSearchActionBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddProcess={handleOpenNewProcessForm}
              onRefresh={handleManualRefresh}
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
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MeusProcessosPage;
