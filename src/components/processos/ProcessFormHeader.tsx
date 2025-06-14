
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface ProcessFormHeaderProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ProcessFormHeader: React.FC<ProcessFormHeaderProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl md:text-2xl font-bold text-white">
        {isEdit ? "Editar Processo" : "Novo Processo"}
      </h2>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="text-white hover:bg-blue-800 -mr-2 -mt-2 md:mr-0 md:mt-0"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ProcessFormHeader;
