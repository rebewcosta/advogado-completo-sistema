
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TarefaForm from './TarefaForm';
import type { TarefaFormData } from '@/hooks/useTarefas';

interface TarefaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: TarefaFormData) => Promise<boolean>;
  tarefaParaForm: Partial<TarefaFormData> & { id?: string } | null;
  processos: Array<{ id: string; numero_processo: string }>;
  clientes: Array<{ id: string; nome: string }>;
  isLoadingDropdownData: boolean;
  isSubmitting: boolean;
}

const TarefaFormDialog: React.FC<TarefaFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  tarefaParaForm,
  processos,
  clientes,
  isLoadingDropdownData,
  isSubmitting
}) => {
  const handleSave = async (formData: TarefaFormData): Promise<boolean> => {
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
      <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-semibold">
            {tarefaParaForm?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto p-4">
          <TarefaForm
            key={tarefaParaForm ? tarefaParaForm.id || 'new-task-key' : 'new-task-key'}
            initialData={tarefaParaForm}
            onSave={handleSave}
            onCancel={onClose}
            processos={processos}
            clientes={clientes}
            isLoadingDropdownData={isLoadingDropdownData}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TarefaFormDialog;
