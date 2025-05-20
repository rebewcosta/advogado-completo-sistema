// src/pages/MeusProcessosPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import AdminLayout from '@/components/AdminLayout';
import { useProcessesStore } from '@/stores/useProcessesStore';
import ProcessesPageContent from '@/components/processos/ProcessesPageContent';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

type Processo = Database['public']['Tables']['processos']['Row'];
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

const MeusProcessosPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  console.log("MeusProcessosPage: Componente renderizado/montado. Usuário inicial:", user); // LOG INICIAL

  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
  const [processoParaForm, setProcessoParaForm] = useState<Partial<ProcessoFormData> & { id?: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [userClients, setUserClients] = useState<ClienteParaSelect[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const {
    processes,
    isLoading: isLoadingProcesses,
    addProcess,
    updateProcess,
    toggleProcessStatus,
    deleteProcess,
    getProcessById,
  } = useProcessesStore();

  const fetchUserClients = useCallback(async () => {
    console.log("MeusProcessosPage: LOG 1 - Iniciando fetchUserClients. Usuário:", user ? user.id : 'Nenhum usuário');
    if (!user) {
      setUserClients([]);
      setIsLoadingClients(false);
      console.log("MeusProcessosPage: LOG 2 - fetchUserClients - Nenhum usuário logado, definindo clientes como [] e parando loading.");
      return;
    }
    setIsLoadingClients(true);
    console.log("MeusProcessosPage: fetchUserClients - Definido isLoadingClients para true.");
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      console.log("MeusProcessosPage: LOG 3 - fetchUserClients - Resposta do Supabase:", { data, error });

      if (error) {
        toast({ title: "Erro ao carregar lista de clientes para formulário", description: error.message, variant: "destructive" });
        // Não re-throw error aqui para que o finally seja sempre executado
      }
      setUserClients(data || []); // Define como array vazio se data for null
      console.log("MeusProcessosPage: LOG 4 - fetchUserClients - Clientes definidos no estado:", data || []);
    } catch (error: any) {
      console.error("MeusProcessosPage: Erro CRÍTICO dentro do try/catch do fetchUserClients:", error);
      setUserClients([]); // Garante que é um array em caso de erro
    } finally {
      setIsLoadingClients(false);
      console.log("MeusProcessosPage: LOG 5 - fetchUserClients - Finalizado. isLoadingClients definido para false.");
    }
  }, [user, toast]);

  useEffect(() => {
    console.log("MeusProcessosPage: LOG 6 - useEffect [user, fetchUserClients] disparado. Usuário atual:", user ? user.id : 'Nenhum usuário');
    if (user) {
        console.log("MeusProcessosPage: useEffect - Usuário existe, chamando fetchUserClients.");
        fetchUserClients();
    } else {
        console.log("MeusProcessosPage: LOG 7 - useEffect - Usuário não disponível, definindo userClients para [] e não buscando.");
        setUserClients([]);
        setIsLoadingClients(false); // Garante que o loading de clientes para se não houver usuário
    }
  }, [user, fetchUserClients]);


  const filteredProcesses = processes.filter(process =>
    process.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (process.nome_cliente_text && process.nome_cliente_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((process.clientes as any)?.nome && (process.clientes as any).nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    process.tipo_processo?.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(p => ({
      ...p,
      // @ts-ignore
      nome_cliente_text: p.clientes ? p.clientes.nome : p.nome_cliente_text
  })) as Processo[];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenNewProcessForm = () => {
    console.log("MeusProcessosPage: handleOpenNewProcessForm chamado.");
    setProcessoParaForm(null);
    setSelectedProcess(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  const handleSaveProcess = async (processFormData: ProcessoFormData) => {
    console.log("MeusProcessosPage: handleSaveProcess chamado com:", processFormData);
    let result;
    if (isEditing && processoParaForm && processoParaForm.id) {
      result = await updateProcess(processoParaForm.id, processFormData);
      if (result) {
        toast({
          title: "Processo atualizado",
          description: `O processo ${result.numero_processo} foi atualizado.`,
        });
      }
    } else {
      result = await addProcess(processFormData);
      if (result) {
        toast({
          title: "Processo cadastrado",
          description: `O processo ${result.numero_processo} foi cadastrado.`,
        });
      }
    }
    if (result) {
      setFormDialogOpen(false);
      setProcessoParaForm(null);
      setIsEditing(false);
    }
  };

  const handleEditProcess = (id: string) => {
    console.log("MeusProcessosPage: handleEditProcess chamado para ID:", id);
    const process = getProcessById(id);
    if (process) {
      const formData = {
        id: process.id,
        numero: process.numero_processo,
        cliente_id: process.cliente_id,
        // @ts-ignore
        nome_cliente_text: process.clientes ? (process.clientes as any).nome : process.nome_cliente_text,
        tipo: process.tipo_processo,
        vara: process.vara_tribunal || '',
        status: process.status_processo as 'Em andamento' | 'Concluído' | 'Suspenso',
        prazo: process.proximo_prazo ? new Date(process.proximo_prazo).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '',
      };
      console.log("MeusProcessosPage: handleEditProcess - Dados preparados para o formulário:", formData);
      setProcessoParaForm(formData);
      setSelectedProcess(null);
      setIsEditing(true);
      setFormDialogOpen(true);
    } else {
      console.warn("MeusProcessosPage: handleEditProcess - Processo não encontrado com ID:", id);
    }
  };

  const handleViewProcess = (id: string) => {
    console.log("MeusProcessosPage: handleViewProcess chamado para ID:", id);
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setProcessoParaForm(null);
      setDetailsDialogOpen(true);
    } else {
      console.warn("MeusProcessosPage: handleViewProcess - Processo não encontrado com ID:", id);
    }
  };

  const handleToggleStatus = async (id: string) => {
    console.log("MeusProcessosPage: handleToggleStatus chamado para ID:", id);
    await toggleProcessStatus(id);
  };

  const handleDeleteProcess = async (id: string) => {
    console.log("MeusProcessosPage: handleDeleteProcess chamado para ID:", id);
    const process = getProcessById(id);
    if (process && window.confirm(`Tem certeza que deseja excluir o processo ${process.numero_processo}?`)) {
      await deleteProcess(id);
    }
  };

  console.log("MeusProcessosPage: LOG 8 - Renderizando. userClients:", userClients, "isLoadingClients:", isLoadingClients);

  if (isLoadingProcesses && !processes.length) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center h-screen">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-500">Carregando processos...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ProcessesPageContent
        processes={filteredProcesses}
        searchTerm={searchTerm}
        formDialogOpen={formDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        selectedProcess={detailsDialogOpen ? selectedProcess : processoParaForm }
        isEditing={isEditing}
        onSearchChange={handleSearchChange}
        onFormDialogOpenChange={(open) => {
          if (!open) {
            setProcessoParaForm(null);
            setIsEditing(false);
          }
          setFormDialogOpen(open);
        }}
        onDetailsDialogOpenChange={(open) => {
          if (!open) {
            setSelectedProcess(null);
          }
          setDetailsDialogOpen(open);
        }}
        onNewProcess={handleOpenNewProcessForm}
        onEditProcess={handleEditProcess}
        onViewProcess={handleViewProcess}
        onToggleStatus={handleToggleStatus}
        onDeleteProcess={handleDeleteProcess}
        onSaveProcess={handleSaveProcess}
        clientesParaForm={userClients}
        isLoadingClientesParaForm={isLoadingClients}
      />
    </AdminLayout>
  );
};

export default MeusProcessosPage;