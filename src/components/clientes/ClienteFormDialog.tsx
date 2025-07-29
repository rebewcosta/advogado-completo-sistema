import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { createClient } from '@/hooks/clientes/clienteApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import ClienteFormHeader from './ClienteFormHeader';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ClienteFormData } from '@/hooks/clientes/types';

interface ClienteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const initialClienteData: ClienteFormData = {
  nome: '',
  email: '',
  telefone: '',
  cpfCnpj: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoes: '',
  tipo_cliente: 'Pessoa Física',
  status_cliente: 'Ativo'
};

const ClienteFormDialog: React.FC<ClienteFormDialogProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const [clienteData, setClienteData] = useState<ClienteFormData>(initialClienteData);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof ClienteFormData, value: any) => {
    setClienteData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await createClient(clienteData, user.id);
      toast({ title: "Sucesso!", description: "Cliente cadastrado com sucesso." });
      setClienteData(initialClienteData);
      onClose();
      onSave();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setClienteData(initialClienteData);
    onClose();
  };

  // Mobile full-screen dialog
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-white"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100dvh',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
              <ClienteFormHeader isEdit={false} onClose={handleClose} />
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50"
              style={{
                height: 'calc(100dvh - 140px)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="p-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                  <ClienteFormFields
                    formData={clienteData}
                    onChange={handleInputChange}
                  />
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex-shrink-0 pb-16 pt-8">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isSaving}
                  className="h-12 px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 h-12 px-6"
                >
                  Cadastrar Cliente
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="
          max-w-4xl w-[95%] sm:w-full 
          bg-gradient-to-br from-gray-900 via-gray-800 to-black 
          border-gray-700 rounded-xl shadow-2xl
          flex flex-col
          max-h-[90vh] h-full
        "
      >
        <ClienteFormHeader isEdit={false} onClose={handleClose} />
        
        <div className="flex-grow overflow-y-auto px-6 py-2 -mx-6 custom-scrollbar">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <ClienteFormFields
              formData={clienteData}
              onChange={handleInputChange}
            />
          </form>
        </div>

        <div className="px-6 pt-4 pb-6 -mx-6 -mb-6 bg-gray-900/50 rounded-b-xl">
           <ClienteFormActions
            isEdit={false}
            onCancel={handleClose}
            isLoading={isSaving}
            onSave={handleSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;