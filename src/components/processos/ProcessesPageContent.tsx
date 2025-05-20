// src/components/processos/ProcessesPageContent.tsx
import React from 'react';
import ProcessSearchActionBar from './ProcessSearchActionBar';
import ProcessTable from './ProcessTable';
import ProcessDialogs from './ProcessDialogs';
import type { Database } from '@/integrations/supabase/types';

type Processo = Database['public']['Tables']['processos']['Row'] & { nome_cliente_text?: string | null; clientes?: { nome: string } | null };
type ClienteParaSelect = Pick<Database['public']['Tables']['clientes']['Row'], 'id' | 'nome'>;

interface ProcessesPageContentProps {
  processes: Processo[];
  searchTerm: string;
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: any; // Pode ser Processo ou ProcessoFormData (para edição)
  isEditing: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onNewProcess: () => void;
  onEditProcess: (id: string) => void;
  onViewProcess: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteProcess: (id: string) => void;
  onSaveProcess: (processData: any) => void; // Ajustar tipo se ProcessoFormData for mais específico
  clientesParaForm: ClienteParaSelect[];
  isLoadingClientesParaForm: boolean;
}

const ProcessesPageContent: React.FC<ProcessesPageContentProps> = ({
  processes,
  searchTerm,
  formDialogOpen,
  detailsDialogOpen,
  selectedProcess,
  isEditing,
  onSearchChange,
  onFormDialogOpenChange,
  onDetailsDialogOpenChange,
  onNewProcess,
  onEditProcess,
  onViewProcess,
  onToggleStatus,
  onDeleteProcess,
  onSaveProcess,
  clientesParaForm, // Prop recebida
  isLoadingClientesParaForm // Prop recebida
}) => {
  console.log("ProcessesPageContent: Props recebidas - clientesParaForm:", clientesParaForm, "isLoadingClientesParaForm:", isLoadingClientesParaForm);

  return (
    <div className="p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Meus Processos</h1>

      <ProcessSearchActionBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onNewProcess={onNewProcess}
      />

      <ProcessTable
        processes={processes}
        onEdit={onEditProcess}
        onView={onViewProcess}
        onToggleStatus={onToggleStatus}
        onDelete={onDeleteProcess}
      />

      <ProcessDialogs
        formDialogOpen={formDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        selectedProcess={selectedProcess}
        isEditing={isEditing}
        onFormDialogOpenChange={onFormDialogOpenChange}
        onDetailsDialogOpenChange={onDetailsDialogOpenChange}
        onSaveProcess={onSaveProcess}
        onEditProcess={onEditProcess}
        // Passando as props para ProcessDialogs
        clientesDoUsuario={clientesParaForm}
        isLoadingClientes={isLoadingClientesParaForm}
      />
    </div>
  );
};

export default ProcessesPageContent;