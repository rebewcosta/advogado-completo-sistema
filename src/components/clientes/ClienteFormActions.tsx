import React from 'react';
import { Button } from "@/components/ui/button";

interface ClienteFormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
  isLoading?: boolean;
  onSave?: () => void;
}

const ClienteFormActions: React.FC<ClienteFormActionsProps> = ({ 
  isEdit, 
  onCancel, 
  isLoading = false,
  onSave
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          type="button"
          onClick={onSave}
          className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
          disabled={isLoading}
        >
          {isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </div>
  );
};

export default ClienteFormActions;
