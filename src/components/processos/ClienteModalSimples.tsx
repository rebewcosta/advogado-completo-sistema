
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useClienteModalSimples } from '@/hooks/useClienteModalSimples';
import { MobileFormWrapper, MobileFormHeader, MobileFormContent, MobileFormFooter } from '@/components/ui/mobile-form-wrapper';
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
      <DialogContent className="max-w-2xl h-[100dvh] sm:h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-none sm:rounded-xl">
        <MobileFormWrapper>
          <MobileFormHeader>
            <ClienteModalHeader onClose={handleClose} />
          </MobileFormHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <MobileFormContent>
              <ClienteModalFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </MobileFormContent>

            <MobileFormFooter>
              <ClienteModalActions
                onCancel={handleClose}
                isSaving={isSaving}
              />
            </MobileFormFooter>
          </form>
        </MobileFormWrapper>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteModalSimples;
