
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useClienteModalSimples } from '@/hooks/useClienteModalSimples';
import ClienteModalHeader from './ClienteModalHeader';
import ClienteModalFields from './ClienteModalFields';
import ClienteModalActions from './ClienteModalActions';

interface ClienteModalSimplesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCliente: (clienteData: any) => void;
  isSaving: boolean;
}

const ClienteModalSimples: React.FC<ClienteModalSimplesProps> = ({
  open,
  onOpenChange,
  onSaveCliente,
  isSaving
}) => {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    resetForm
  } = useClienteModalSimples(onSaveCliente);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          <ClienteModalHeader onClose={handleClose} />

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="bg-white m-6 rounded-xl p-6 flex-1 max-h-[60vh] overflow-y-auto">
              <ClienteModalFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </div>

            <div className="p-6">
              <ClienteModalActions
                onCancel={handleClose}
                isSaving={isSaving}
              />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModalSimples;
