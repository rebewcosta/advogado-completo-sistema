
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const RegisterFormHeader: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-white">
            Criar Conta
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Crie sua conta para acessar a plataforma. Preencha todos os campos obrigatórios 
                para começar a usar o sistema de gestão jurídica.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-blue-200">
          Preencha os dados abaixo para criar sua conta
        </p>
      </div>
    </TooltipProvider>
  );
};

export default RegisterFormHeader;
