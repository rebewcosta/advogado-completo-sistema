
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
    <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end gap-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="w-full sm:w-auto px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 min-h-[48px]"
        disabled={isSaving}
      >
        Cancelar
      </Button>
      <Button 
        type="submit"
        className="w-full sm:w-auto px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 min-h-[48px]"
        disabled={isSaving}
      >
        {isSaving ? 'Salvando...' : 'Cadastrar Cliente'}
      </Button>
    </div>
  );
};

export default ClienteModalActions;
