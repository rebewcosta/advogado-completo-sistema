
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
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
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose(); }}>
        <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] flex flex-col bg-slate-900 border-blue-700">
          <DialogHeader className="p-6 pb-4 border-b border-blue-700 flex-shrink-0">
            <DialogTitle className="text-white flex items-center gap-2">
              {tarefaParaForm?.id ? 'Editar Tarefa' : 'Nova Tarefa'}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    {tarefaParaForm?.id 
                      ? "Atualize as informações da tarefa. Campos com * são obrigatórios."
                      : "Organize suas pendências e prazos de forma eficiente. Defina título, prazo e associe a processos ou clientes quando necessário."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto p-6 bg-slate-900">
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
    </TooltipProvider>
  );
};

export default TarefaFormDialog;
