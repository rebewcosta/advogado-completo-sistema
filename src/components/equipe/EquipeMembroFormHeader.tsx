
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EquipeMembroFormHeaderProps {
  isEdit: boolean;
}

const EquipeMembroFormHeader: React.FC<EquipeMembroFormHeaderProps> = ({ isEdit }) => {
  return (
    <TooltipProvider>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-white">
          {isEdit ? 'Editar Membro' : 'Novo Membro da Equipe'}
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {isEdit 
                  ? "Atualize as informações do membro da equipe. Campos com * são obrigatórios."
                  : "Adicione um novo membro à sua equipe. Defina nome, cargo e permissões de acesso."}
              </p>
            </TooltipContent>
          </Tooltip>
        </DialogTitle>
      </DialogHeader>
    </TooltipProvider>
  );
};

export default EquipeMembroFormHeader;
