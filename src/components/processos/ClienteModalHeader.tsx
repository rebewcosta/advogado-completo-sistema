
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
    <>
      <DialogTitle className="sr-only">Novo Cliente</DialogTitle>
      <TooltipProvider>
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-white text-xl font-semibold">Novo Cliente</h2>
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
            className="text-white hover:bg-white/20 -mr-2 -mt-2 min-h-[48px] min-w-[48px]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </TooltipProvider>
    </>
  );
};

export default ClienteModalHeader;
