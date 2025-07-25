
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@/components/ui/dialog";
import { X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClienteModalHeaderProps {
  onClose: () => void;
}

const ClienteModalHeader: React.FC<ClienteModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="p-3 md:p-4 pb-2 md:pb-3 flex-shrink-0">
      <TooltipProvider>
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-white text-base md:text-lg font-semibold">
              Novo Cliente
            </DialogTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-blue-200 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Cadastre um novo cliente preenchendo os campos obrigatórios.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 -mr-1 md:-mr-2 -mt-1 md:-mt-2"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ClienteModalHeader;
