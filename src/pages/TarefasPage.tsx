
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import AdminLayout from '@/components/AdminLayout';
import { ListChecks } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useTarefas, type TarefaFormData } from '@/hooks/useTarefas';
import TarefaTable from '@/components/tarefas/TarefaTable';
import TarefaListAsCards from '@/components/tarefas/TarefaListAsCards';
import TarefaFormDialog from '@/components/tarefas/TarefaFormDialog';
import TarefaSearchActionBar from '@/components/tarefas/TarefaSearchActionBar';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { format, parseISO } from 'date-fns';
import type { TarefaComRelacoes } from '@/types/tarefas';

const TarefasPage = () => {
  const {
    tarefas,
    isLoading,
    isSubmitting,
    processosDoUsuario,
    clientesDoUsuario,
    isLoadingDropdownData,
    saveTarefa,
    deleteTarefa,
    toggleStatusTarefa,
    handleManualRefresh
  } = useTarefas();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tarefaParaForm, setTarefaParaForm] = useState<Partial<TarefaFormData> & { id?: string } | null>(null);

  // Filtrar tarefas com verificação de segurança
  const filteredTarefas = (tarefas || []).filter(tarefa => {
    if (!tarefa) return false;
    const titulo = tarefa.titulo || '';
    const descricao = tarefa.descricao_detalhada || '';
    return titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           descricao.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenForm = (tarefaToEdit?: TarefaComRelacoes) => {
    if (tarefaToEdit && typeof tarefaToEdit === 'object' && 'id' in tarefaToEdit) {
      const formData: Partial<TarefaFormData> & { id: string } = {
        id: tarefaToEdit.id,
        titulo: tarefaToEdit.titulo || '',
        descricao: tarefaToEdit.descricao_detalhada || '',
        data_conclusao: tarefaToEdit.data_conclusao ? format(parseISO(tarefaToEdit.data_conclusao), 'yyyy-MM-dd') : undefined,
        prioridade: (tarefaToEdit.prioridade as TarefaFormData['prioridade']) || 'Média',
        status: (tarefaToEdit.status as TarefaFormData['status']) || 'Pendente',
        processo_id: tarefaToEdit.processo_id || undefined,
        cliente_id: tarefaToEdit.cliente_id || undefined,
      };
      setTarefaParaForm(formData);
    } else {
      setTarefaParaForm({ prioridade: 'Média', status: 'Pendente' });
    }
    setIsFormOpen(true);
  };

  const handleSaveTarefa = async (formData: any): Promise<boolean> => {
    // Convert formData to TarefaFormData format ensuring proper types
    const tarefaFormData: TarefaFormData = {
      titulo: formData.titulo || '',
      descricao: formData.descricao || '',
      data_conclusao: formData.data_conclusao,
      prioridade: (formData.prioridade as TarefaFormData['prioridade']) || 'Média',
      status: (formData.status as TarefaFormData['status']) || 'Pendente',
      processo_id: formData.processo_id,
      cliente_id: formData.cliente_id,
    };
    
    const success = await saveTarefa(tarefaFormData, tarefaParaForm?.id);
    if (success) {
      setTarefaParaForm(null);
    }
    return success;
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTarefaParaForm(null);
  };

  const handleDeleteTarefa = async (tarefaId: string) => {
    await deleteTarefa(tarefaId);
  };

  const handleToggleStatusTarefa = async (tarefa: TarefaComRelacoes) => {
    if (!tarefa || !tarefa.status) {
      console.error('Tarefa inválida para alteração de status:', tarefa);
      return;
    }
    
    const statusOrder: TarefaFormData['status'][] = ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada'];
    const currentIndex = statusOrder.indexOf(tarefa.status as any);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    await toggleStatusTarefa(tarefa as any, nextStatus);
  };

  // Convert tarefas to TarefaComRelacoes format for components com verificação de segurança
  const tarefasComRelacoes: TarefaComRelacoes[] = filteredTarefas
    .filter(tarefa => tarefa && tarefa.id) // Filtrar tarefas inválidas
    .map(tarefa => ({
      id: tarefa.id,
      titulo: tarefa.titulo || '',
      descricao_detalhada: tarefa.descricao_detalhada || '',
      status: (tarefa.status as any) || 'Pendente',
      prioridade: (tarefa.prioridade as any) || 'Média',
      data_vencimento: tarefa.data_vencimento || null,
      data_conclusao: tarefa.data_conclusao || null,
      cliente_id: tarefa.cliente_id || null,
      processo_id: tarefa.processo_id || null,
      user_id: tarefa.user_id || '',
      created_at: tarefa.created_at || '',
      updated_at: tarefa.updated_at || '',
      processos: tarefa.processos || null,
      clientes: tarefa.clientes || null,
    }));

  if (isLoading && (!tarefas || tarefas.length === 0)) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 overflow-auto min-w-0">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center">
              <Spinner size="lg" />
              <span className="text-gray-500 mt-3">Carregando tarefas...</span>
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="p-4 md:p-6 lg:p-8">
              <SharedPageHeader
                title="Gerenciador de Tarefas"
                description="Organize e acompanhe suas pendências e prazos."
                pageIcon={<ListChecks />} 
                isLoading={isLoading}
                showActionButton={false}
              />
              
              <TarefaSearchActionBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddTask={() => handleOpenForm()}
                onRefresh={handleManualRefresh}
                isLoading={isLoading}
              />

              <div className="hidden md:block">
                <TarefaTable
                  tarefas={tarefasComRelacoes}
                  onEdit={handleOpenForm}
                  onDelete={handleDeleteTarefa}
                  onToggleStatus={handleToggleStatusTarefa}
                  isLoading={isLoading}
                  searchTerm={searchTerm}
                />
              </div>
              <div className="md:hidden">
                <TarefaListAsCards
                  tarefas={tarefasComRelacoes}
                  onEdit={handleOpenForm}
                  onDelete={handleDeleteTarefa}
                  onToggleStatus={handleToggleStatusTarefa}
                  isLoading={isLoading}
                />
              </div>

              <TarefaFormDialog
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSaveTarefa}
                tarefaParaForm={tarefaParaForm}
                processos={processosDoUsuario || []}
                clientes={clientesDoUsuario || []}
                isLoadingDropdownData={isLoadingDropdownData}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TarefasPage;
