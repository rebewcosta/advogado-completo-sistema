
import React from 'react';
import { Button } from "@/components/ui/button";

interface ClienteModalActionsProps {
  onCancel: () => void;
  isSaving: boolean;
}

const ClienteModalActions: React.FC<ClienteModalActionsProps> = ({
  onCancel,
  isSaving
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
          disabled={isSaving}
        >
          Cadastrar Cliente
        </Button>
      </div>
    </div>
  );
};

export default ClienteModalActions;
