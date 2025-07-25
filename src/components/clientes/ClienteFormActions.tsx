// src/components/clientes/ClienteFormActions.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { useClientesState } from '@/hooks/clientes/useClientesState';
import { useClientesActions } from '@/hooks/clientes/useClientesActions';

const ClienteFormActions = () => {
  const { isSubmitting, selectedCliente, handleModalClose } = useClientesState();
  const { handleSave } = useClientesActions();

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      handleModalClose();
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={handleModalClose} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </>
  );
};

export default ClienteFormActions;