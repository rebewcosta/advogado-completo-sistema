
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProcessFormHeaderProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ProcessFormHeader: React.FC<ProcessFormHeaderProps> = ({ isEdit, onCancel }) => {
  return (
    <TooltipProvider>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-white">
            {isEdit ? "Editar Processo" : "Novo Processo"}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {isEdit 
                  ? "Atualize as informações do processo. Campos com * são obrigatórios."
                  : "Preencha os dados do novo processo. Campos com * são obrigatórios."}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-blue-800 -mr-2 -mt-2 md:mr-0 md:mt-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
};

export default ProcessFormHeader;
