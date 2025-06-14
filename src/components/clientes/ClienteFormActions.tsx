
import React from 'react';
import { Button } from "@/components/ui/button";

interface ClienteFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

const ClienteFormActions: React.FC<ClienteFormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex justify-end gap-3 pt-0">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
      >
        Cancelar
      </Button>
      <Button 
        type="submit"
        className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
      >
        {isEdit ? "Salvar Alterações" : "Cadastrar Cliente"}
      </Button>
    </div>
  );
};

export default ClienteFormActions;
