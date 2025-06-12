
import React from 'react';
import { Button } from "@/components/ui/button";

interface ProcessFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ProcessFormActions: React.FC<ProcessFormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex justify-end space-x-3 mt-8">
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? "Salvar Alterações" : "Cadastrar Processo"}
      </Button>
    </div>
  );
};

export default ProcessFormActions;
