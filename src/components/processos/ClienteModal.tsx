
import React from 'react';
import ClienteFormDialog from "@/components/clientes/ClienteFormDialog";

interface ClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCliente: (clienteData: any) => Promise<void>;
  isSaving: boolean;
}

const ClienteModal: React.FC<ClienteModalProps> = ({
  open,
  onOpenChange,
  onSaveCliente,
  isSaving
}) => {
  return (
    <ClienteFormDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      onSave={async () => {
        await onSaveCliente({});
        onOpenChange(false);
      }}
    />
  );
};

export default ClienteModal;
