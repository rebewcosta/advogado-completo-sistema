
import React from 'react';
import ProcessSearchActionBar from './ProcessSearchActionBar';
import ProcessTable from './ProcessTable';
import ProcessDialogs from './ProcessDialogs';

interface Process {
  id: string;
  numero: string;
  cliente: string;
  tipo: string;
  vara: string;
  status: 'Em andamento' | 'Concluído' | 'Suspenso';
  prazo: string;
}

interface ProcessesPageContentProps {
  processes: Process[];
  searchTerm: string;
  formDialogOpen: boolean;
  detailsDialogOpen: boolean;
  selectedProcess: Process | null;
  isEditing: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormDialogOpenChange: (open: boolean) => void;
  onDetailsDialogOpenChange: (open: boolean) => void;
  onNewProcess: () => void;
  onEditProcess: (id: string) => void;
  onViewProcess: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteProcess: (id: string) => void;
  onSaveProcess: (processData: any) => void;
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
  onSaveProcess
}) => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Meus Processos</h1>
      
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
      />
    </div>
  );
};

export default ProcessesPageContent;
