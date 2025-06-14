// src/components/processos/ProcessesPageContent.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import { useProcessesStore, ProcessoComCliente } from '@/stores/useProcessesStore';
import ProcessSearchActionBar from '@/components/processos/ProcessSearchActionBar';
import ProcessListAsCards from '@/components/processos/ProcessListAsCards';
import MeusProcessosTable from '@/components/processos/MeusProcessosTable';
import ProcessDialogs from '@/components/processos/ProcessDialogs';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';

type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

type ProcessoFormData = {
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
};

type ProcessoFormDataParaForm = {
  numero: string;
  cliente_id: string | null;
  nome_cliente_text?: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
  id?: string;
};

const ProcessesPageContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessoComCliente | null>(null);
  const [processoParaForm, setProcessoParaForm] = useState<ProcessoFormDataParaForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userClients, setUserClients] = useState<ClienteParaSelect[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    processes,
    isLoading: isLoadingProcessesStore,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById,
    fetchProcesses,
  } = useProcessesStore();

  const [isRefreshingManually, setIsRefreshingManually] = useState(false);

  const fetchUserClients = useCallback(async () => {
    if (!user) { setUserClients([]); setIsLoadingClients(false); return; }
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase.from('clientes').select('id, nome').eq('user_id', user.id).order('nome', { ascending: true });
      if (error) { toast({ title: "Erro ao carregar clientes", description: error.message, variant: "destructive" });}
      setUserClients(data || []);
    } catch (error: any) {
      toast({ title: "Erro crítico ao carregar clientes", description: error.message, variant: "destructive" });
      setUserClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) { fetchUserClients(); } 
    else { setUserClients([]); setIsLoadingClients(false); }
  }, [user, fetchUserClients]);

  const filteredProcesses = processes.filter(process =>
    process.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (process.nome_cliente_text && process.nome_cliente_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (process.clientes?.nome && process.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    process.tipo_processo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenNewProcessForm = () => {
    setProcessoParaForm(null);
    setSelectedProcess(null); 
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  const handleSaveProcess = async (processFormData: ProcessoFormData) => {
    setIsSubmitting(true);
    let result;
    if (isEditing && processoParaForm && processoParaForm.id) {
      result = await updateProcess(processoParaForm.id, processFormData);
    } else {
      result = await addProcess(processFormData);
    }
    if (result) {
      toast({
        title: isEditing ? "Processo atualizado" : "Processo cadastrado",
        description: `O processo ${result.numero_processo} foi ${isEditing ? 'atualizado' : 'cadastrado'}.`,
      });
      setFormDialogOpen(false);
      setProcessoParaForm(null);
      setIsEditing(false);
    }
    setIsSubmitting(false);
  };

  const handleEditProcess = (processo: ProcessoComCliente) => {
    const formData: ProcessoFormDataParaForm = {
      id: processo.id,
      numero: processo.numero_processo || "",
      cliente_id: processo.cliente_id || null,
      nome_cliente_text: processo.clientes?.nome || processo.nome_cliente_text || "",
      tipo: processo.tipo_processo || "",
      vara: processo.vara_tribunal || "",
      status: (processo.status_processo as ProcessoFormData['status']) || "Em andamento",
      prazo: processo.proximo_prazo ? new Date(processo.proximo_prazo + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "",
    };
    setProcessoParaForm(formData);
    setSelectedProcess(null); 
    setIsEditing(true);
    setFormDialogOpen(true);
    setDetailsDialogOpen(false);
  };

  const handleViewProcess = (processo: ProcessoComCliente) => {
    setSelectedProcess(processo);
    setProcessoParaForm(null);
    setDetailsDialogOpen(true);
    setFormDialogOpen(false);
  };

  const handleToggleStatus = async (processo: ProcessoComCliente) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await toggleProcessStatus(processo.id);
    setIsSubmitting(false);
  };

  const handleDeleteProcess = async (id: string) => {
    if (isSubmitting) return;
    const process = getProcessById(id);
    if (process && window.confirm(`Tem certeza que deseja excluir o processo ${process.numero_processo}?`)) {
      setIsSubmitting(true);
      await deleteProcess(id);
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshingManually(true);
    await fetchProcesses(); 
    setIsRefreshingManually(false);
    toast({title: "Lista de processos atualizada!"});
  };
  
  const isLoadingCombined = isLoadingProcessesStore || isRefreshingManually || isSubmitting;

  if (isLoadingCombined && !processes.length && !isRefreshingManually) {
    return (
      <AdminLayout>
        <div className="p-4 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando processos...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 bg-lawyer-background min-h-full">
        <SharedPageHeader
            title="Meus Processos"
            description="Gerencie e acompanhe todos os seus processos jurídicos."
            pageIcon={<FileText />}
            actionButtonText="Novo Processo"
            onActionButtonClick={handleOpenNewProcessForm}
            isLoading={isLoadingCombined}
        />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4"> 
                <ProcessSearchActionBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onNewProcess={handleOpenNewProcessForm}
                />
            </CardContent>
        </Card>
        
        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
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
        <div className="md:hidden">
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
            if (processToEdit) handleEditProcess(processToEdit as ProcessoComCliente);
          }}
          clientesDoUsuario={userClients}
          isLoadingClientes={isLoadingClients}
        />
      </div>
    </AdminLayout>
  );
};

export default ProcessesPageContent;
