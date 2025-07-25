// src/components/clientes/ClienteFormDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useClientesState } from '@/hooks/clientes/useClientesState';
import ClienteFormHeader from './ClienteFormHeader';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';

type ClienteFormDialogProps = {
  children: React.ReactNode;
};

const ClienteFormDialog = ({ children }: ClienteFormDialogProps) => {
  const { isModalOpen, handleModalOpenChange } = useClientesState();

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] p-0">
        <div className="p-6">
          <ClienteFormHeader />
        </div>
        
        {/* Essa div é a chave da correção: ela permite que apenas esta área seja rolável */}
        <div className="flex-grow overflow-y-auto px-6">
          <ClienteFormFields />
        </div>

        <DialogFooter className="p-6 mt-auto bg-gray-50 border-t">
          <ClienteFormActions />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;