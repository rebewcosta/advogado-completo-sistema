
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { X } from 'lucide-react';

interface ClienteFormHeaderProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ClienteFormHeader: React.FC<ClienteFormHeaderProps> = ({ isEdit, onCancel }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-blue-900 border-b border-blue-700">
      <h2 className="text-lg font-semibold text-white">
        {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="text-white hover:bg-blue-800 -mr-2 -mt-2 md:mr-0 md:mt-0"
      >
        <X className="h-5 w-5" />
      </Button>
    </CardHeader>
  );
};

export default ClienteFormHeader;
