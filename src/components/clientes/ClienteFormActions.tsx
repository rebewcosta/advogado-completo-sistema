import React from 'react';
import { Button } from '@/components/ui/button';

interface ClienteFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ClienteFormActions: React.FC<ClienteFormActionsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};