
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X } from 'lucide-react';

interface ClienteFormHeaderProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ClienteFormHeader: React.FC<ClienteFormHeaderProps> = ({ isEdit, onCancel }) => {
  return (
    <CardHeader className="px-4 py-4 md:px-6 md:py-5 border-b border-blue-600 bg-lawyer-dark">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-lg md:text-xl text-white">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-blue-200">
            {isEdit 
              ? 'Atualize os dados do cliente no formulário abaixo.' 
              : 'Preencha os dados do cliente no formulário abaixo.'}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-blue-700">
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default ClienteFormHeader;
