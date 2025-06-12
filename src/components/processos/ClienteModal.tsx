
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClienteForm from "@/components/ClienteForm";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
        </DialogHeader>
        <ClienteForm
          onSave={onSaveCliente}
          onCancel={() => onOpenChange(false)}
          isEdit={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModal;
