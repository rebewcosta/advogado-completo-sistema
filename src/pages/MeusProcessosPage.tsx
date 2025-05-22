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
import { FileText } from 'lucide-react'; // Ícone para o cabeçalho

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
    if (!user) {
      setUserClients([]);
      setIsLoadingClients(false);
      return;
    }
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      if (error) {
        toast({ title: "Erro ao carregar lista de clientes para formulário", description: error.message, variant: "destructive" });
      }
      setUserClients(data || []);
    } catch (error: any) {
      console.error("MeusProcessosPage: Erro CRÍTICO dentro do try/catch do fetchUserClients:", error);
      setUserClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
        fetchUserClients();
    } else {
        setUserClients([]);
        setIsLoadingClients(false);
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
    setProcessoParaForm(null);
    setSelectedProcess(null);
    setIsEditing(false);
    setFormDialogOpen(true);
  };

  const handleSaveProcess = async (processFormData: ProcessoFormData) => {
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
      setProcessoParaForm(formData);
      setSelectedProcess(null);
      setIsEditing(true);
      setFormDialogOpen(true);
    }
  };

  const handleViewProcess = (id: string) => {
    const process = getProcessById(id);
    if (process) {
      setSelectedProcess(process);
      setProcessoParaForm(null);
      setDetailsDialogOpen(true);
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleProcessStatus(id);
  };

  const handleDeleteProcess = async (id: string) => {
    const process = getProcessById(id);
    if (process && window.confirm(`Tem certeza que deseja excluir o processo ${process.numero_processo}?`)) {
      await deleteProcess(id);
    }
  };

  if (isLoadingProcesses && !processes.length) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex justify-center items-center">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-500">Carregando processos...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
            <FileText className="mr-3 h-7 w-7 text-lawyer-primary" />
            Meus Processos
          </h1>
          <p className="text-gray-600 text-left mt-1">
            Gerencie e acompanhe todos os seus processos jurídicos.
          </p>
        </div>

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
      </div>
    </AdminLayout>
  );
};

export default MeusProcessosPage;