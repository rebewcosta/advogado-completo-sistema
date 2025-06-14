
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";

interface ClienteFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ClienteFormActions: React.FC<ClienteFormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <CardFooter className="flex justify-end gap-2 pt-4 px-4 py-3 md:px-6 md:py-4 border-t border-blue-600 bg-lawyer-dark">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">
        {isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
      </Button>
    </CardFooter>
  );
};

export default ClienteFormActions;
