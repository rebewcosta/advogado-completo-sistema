import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import ClienteFormHeader from './ClienteFormHeader';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import type { Database } from '@/integrations/supabase/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils'; // Importe a função 'cn'

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

  const FormContent = (
    <div className="flex h-full flex-col rounded-t-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      <ClienteFormHeader isEdit={!!cliente} onClose={onClose} />
      
      {/* O formulário agora ocupa o espaço restante sem esconder o overflow */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          
          {/* ESTA É A MUDANÇA PRINCIPAL:
            - `overflow-y-auto` garante que a rolagem só apareça quando necessário.
            - `scrollbar-thin` e as outras classes `scrollbar-*` estilizam a barra de rolagem (opcional, mas melhora a aparência).
          */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100/50">
              <ClienteFormFields formData={formData} onChange={handleFieldChange} />
          </div>

          {/* A área de ações fica fixa na parte inferior */}
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
                  {FormContent}
              </DrawerContent>
          </Drawer>
      );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 bg-transparent border-0 rounded-xl overflow-hidden">
        {FormContent}
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;