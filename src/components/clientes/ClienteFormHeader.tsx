
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClienteFormHeaderProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ClienteFormHeader: React.FC<ClienteFormHeaderProps> = ({ isEdit, onCancel }) => {
  return (
    <TooltipProvider>
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-white text-xl font-semibold">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-200 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                {isEdit 
                  ? "Atualize as informações do cliente. Campos com * são obrigatórios."
                  : "Cadastre um novo cliente preenchendo todos os campos obrigatórios."}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-white/20 -mr-2 -mt-2 md:mr-0 md:mt-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
};

export default ClienteFormHeader;
