
import React from 'react';
import { Button } from "@/components/ui/button";

interface ProcessFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ProcessFormActions: React.FC<ProcessFormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
        className="bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
      >
        Cancelar
      </Button>
      <Button 
        type="submit"
        className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
      >
        {isEdit ? "Salvar Alterações" : "Cadastrar Processo"}
      </Button>
    </div>
  );
};

export default ProcessFormActions;
