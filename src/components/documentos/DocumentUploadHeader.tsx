
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const DocumentUploadHeader: React.FC = () => {
  return (
    <TooltipProvider>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-white">
          Enviar novo documento
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Faça upload de documentos e associe-os a clientes ou processos. 
                Limite máximo de 3MB por arquivo.
              </p>
            </TooltipContent>
          </Tooltip>
        </DialogTitle>
      </DialogHeader>
    </TooltipProvider>
  );
};

export default DocumentUploadHeader;
