
import React from 'react';
import { Button } from "@/components/ui/button";

interface ProcessFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ProcessFormActions: React.FC<ProcessFormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-blue-600">
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? "Salvar Alterações" : "Cadastrar Processo"}
      </Button>
    </div>
  );
};

export default ProcessFormActions;
