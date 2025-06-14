
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EquipeTarefaFormHeaderProps {
  isEdit: boolean;
}

const EquipeTarefaFormHeader: React.FC<EquipeTarefaFormHeaderProps> = ({ isEdit }) => {
  return (
    <TooltipProvider>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-white">
          {isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {isEdit 
                  ? "Atualize as informações da tarefa. Campos com * são obrigatórios."
                  : "Crie uma nova tarefa definindo título, descrição, responsável e prazo."}
              </p>
            </TooltipContent>
          </Tooltip>
        </DialogTitle>
      </DialogHeader>
    </TooltipProvider>
  );
};

export default EquipeTarefaFormHeader;
