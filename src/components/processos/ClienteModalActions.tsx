
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
    <div className="px-3 md:px-4 pb-3 md:pb-4 flex-shrink-0 border-t border-white/10 bg-gradient-to-r from-blue-600/50 to-purple-600/50 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-3 md:px-4 py-2 h-9 md:h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 text-sm md:text-base"
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="px-3 md:px-4 py-2 h-9 md:h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 text-sm md:text-base"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </div>
  );
};

export default ClienteModalActions;
