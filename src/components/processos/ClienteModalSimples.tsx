
import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useClienteModalSimples } from '@/hooks/useClienteModalSimples';
import { useMobileOptimization } from '@/hooks/useMobileOptimization';
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
  useMobileOptimization();
  
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
      <DialogContent className="w-full max-w-[95vw] md:max-w-2xl h-[95vh] md:h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl m-2">
        <div className="h-full flex flex-col">
          <ClienteModalHeader onClose={handleClose} />

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="bg-white mx-4 md:mx-6 mb-4 rounded-xl p-4 md:p-6 flex-1 overflow-y-auto touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
              <ClienteModalFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </div>

            <div className="p-4 md:p-6 pt-0">
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
