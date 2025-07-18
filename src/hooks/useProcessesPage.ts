
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useProcessesStore, ProcessoComCliente } from '@/stores/useProcessesStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

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

export const useProcessesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [processDetailsModalOpen, setProcessDetailsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessoComCliente | null>(null);
  const [selectedProcessForDetails, setSelectedProcessForDetails] = useState<ProcessoComCliente | null>(null);
  const [processoParaForm, setProcessoParaForm] = useState<ProcessoFormDataParaForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userClients, setUserClients] = useState<ClienteParaSelect[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);
  const [escavadorDialogOpen, setEscavadorDialogOpen] = useState(false);

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
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
    // Para processos importados (sem cliente_id), preservar o nome_cliente_text original
    const nomeCliente = processo.cliente_id 
      ? processo.clientes?.nome || ""  // Se tem cliente associado, usar o nome do cliente
      : processo.nome_cliente_text || "";  // Se não tem cliente, usar o texto original (casos importados)
    
    // Validar e mapear status para valores aceitos
    const statusValido: ProcessoFormData['status'] = ['Em andamento', 'Concluído', 'Suspenso'].includes(processo.status_processo as any)
      ? (processo.status_processo as ProcessoFormData['status'])
      : "Em andamento";

    const formData: ProcessoFormDataParaForm = {
      id: processo.id,
      numero: processo.numero_processo || "",
      cliente_id: processo.cliente_id || null,
      nome_cliente_text: nomeCliente,
      tipo: processo.tipo_processo || "",
      vara: processo.vara_tribunal || "",
      status: statusValido,
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

  const handleViewProcessDetails = (processo: ProcessoComCliente) => {
    setSelectedProcessForDetails(processo);
    setProcessDetailsModalOpen(true);
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

  const handleOpenEscavadorImport = () => {
    setEscavadorDialogOpen(true);
  };

  const handleEscavadorImportComplete = async () => {
    await fetchProcesses(); // Recarregar lista após importação
    toast({
      title: "Importação concluída",
      description: "Processos importados com sucesso do Escavador"
    });
  };

  const isLoadingCombined = isLoadingProcessesStore || isRefreshingManually || isSubmitting;

  return {
    // State
    searchTerm,
    formDialogOpen,
    detailsDialogOpen,
    processDetailsModalOpen,
    selectedProcess,
    selectedProcessForDetails,
    processoParaForm,
    isEditing,
    userClients,
    isLoadingClients,
    isSubmitting,
    isRefreshingManually,
    processes,
    filteredProcesses,
    isLoadingCombined,
    escavadorDialogOpen,
    
    // Actions
    handleSearchChange,
    handleOpenNewProcessForm,
    handleSaveProcess,
    handleEditProcess,
    handleViewProcess,
    handleViewProcessDetails,
    handleToggleStatus,
    handleDeleteProcess,
    handleManualRefresh,
    handleOpenEscavadorImport,
    handleEscavadorImportComplete,
    setFormDialogOpen,
    setDetailsDialogOpen,
    setProcessDetailsModalOpen,
    setProcessoParaForm,
    setIsEditing,
    setSelectedProcess,
    setSelectedProcessForDetails,
    setEscavadorDialogOpen,
    getProcessById,
    fetchUserClients
  };
};
