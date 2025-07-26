import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import ClienteFormHeader from './ClienteFormHeader';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import type { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Importa o componente para esconder visualmente

type Cliente = Database['public']['Tables']['clientes']['Row'];

interface ClienteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  cliente: Cliente | null;
}

const ClienteFormDialog: React.FC<ClienteFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  cliente
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    tipo_cliente: 'Pessoa Física',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    status_cliente: 'Ativo',
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        cpfCnpj: cliente.cpfCnpj || '',
        tipo_cliente: cliente.tipo_cliente || 'Pessoa Física',
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: cliente.cep || '',
        status_cliente: cliente.status_cliente || 'Ativo',
        observacoes: cliente.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpfCnpj: '',
        tipo_cliente: 'Pessoa Física',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        status_cliente: 'Ativo',
        observacoes: ''
      });
    }
  }, [cliente, isOpen]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = ({ isMobile = false }) => (
    <div className="flex h-full flex-col rounded-t-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      {/* Título e Descrição para Acessibilidade */}
      <VisuallyHidden>
        {isMobile ? (
          <>
            <DrawerTitle>{cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DrawerTitle>
            <DrawerDescription>Preencha ou modifique os dados do cliente e clique em salvar.</DrawerDescription>
          </>
        ) : (
          <>
            <DialogTitle>{cliente ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</DialogTitle>
            <DialogDescription>Preencha ou modifique os dados do cliente e clique em salvar.</DialogDescription>
          </>
        )}
      </VisuallyHidden>

      <ClienteFormHeader isEdit={!!cliente} onClose={onClose} />
      
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100/50">
              <ClienteFormFields formData={formData} onChange={handleFieldChange} />
          </div>
          <div className="flex-shrink-0 border-t border-white/20 px-6 pb-6 pt-4">
              <ClienteFormActions isEdit={!!cliente} onCancel={onClose} isLoading={isLoading} />
          </div>
      </form>
    </div>
  );

  if (isMobile) {
      return (
          <Drawer open={isOpen} onOpenChange={onClose}>
              <DrawerContent className="max-h-[90vh] border-0 bg-transparent p-0">
                  <FormContent isMobile={true} />
              </DrawerContent>
          </Drawer>
      );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 bg-transparent border-0 rounded-xl overflow-hidden">
        <FormContent isMobile={false}/>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;