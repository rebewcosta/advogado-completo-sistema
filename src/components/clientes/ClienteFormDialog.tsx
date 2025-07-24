
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ClienteFormHeader from './ClienteFormHeader';
import ClienteFormFields from './ClienteFormFields';
import ClienteFormActions from './ClienteFormActions';
import type { Database } from '@/integrations/supabase/types';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl">
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          <ClienteFormHeader isEdit={!!cliente} onClose={onClose} />
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="bg-white m-6 rounded-xl p-6 flex-1 max-h-[60vh] overflow-y-auto">
              <ClienteFormFields formData={formData} onChange={handleFieldChange} />
            </div>
            <div className="p-6">
              <ClienteFormActions isEdit={!!cliente} onCancel={onClose} isLoading={isLoading} />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;
