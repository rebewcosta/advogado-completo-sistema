import React, { useState, useEffect } from 'react';
import ClienteFormHeader from '@/components/clientes/ClienteFormHeader';
import ClienteFormFields from '@/components/clientes/ClienteFormFields';
import ClienteFormActions from '@/components/clientes/ClienteFormActions';
import { useClienteValidation } from '@/components/clientes/ClienteFormValidation';
import { MobileFormWrapper } from '@/components/MobileFormWrapper';

interface ClienteFormProps {
  onSave: (cliente: any) => void;
  onCancel: () => void;
  cliente?: any; 
  isEdit?: boolean;
}

const ClienteForm = ({ onSave, onCancel, cliente, isEdit = false }: ClienteFormProps) => {
  const { validateCliente } = useClienteValidation();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'Pessoa Física',
    tipo_cliente: 'Pessoa Física', 
    cpfCnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
    status_cliente: 'Ativo' 
  });

  useEffect(() => {
    if (isEdit && cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        tipo: cliente.tipo_cliente || 'Pessoa Física',
        tipo_cliente: cliente.tipo_cliente || 'Pessoa Física',
        cpfCnpj: cliente.cpfCnpj || '', 
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: cliente.cep || '',
        observacoes: cliente.observacoes || '',
        status_cliente: cliente.status_cliente || 'Ativo'
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        tipo: 'Pessoa Física',
        tipo_cliente: 'Pessoa Física',
        cpfCnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        observacoes: '',
        status_cliente: 'Ativo'
      });
    }
  }, [cliente, isEdit]);

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'tipo_cliente') {
      setFormData(prev => ({ ...prev, [field]: value, tipo: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = await validateCliente(formData);
    if (!validation.valid) return;

    onSave(validation.data);
  };

  return (
    <MobileFormWrapper className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 md:p-6 rounded-t-xl shadow-xl">
          <ClienteFormHeader isEdit={isEdit} onClose={onCancel} />
        </div>

        {/* Form Content - Scrollable */}
        <div className="bg-white p-4 md:p-6 pb-24 md:pb-6">
          <form onSubmit={handleSubmit}>
            <ClienteFormFields
              formData={formData}
              onChange={handleFieldChange}
            />
          </form>
        </div>

        {/* Botões - Fixos na parte inferior no mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 shadow-2xl z-50 md:relative md:bg-gradient-to-r md:from-blue-600 md:via-indigo-600 md:to-purple-600 md:rounded-b-xl md:shadow-xl">
          <ClienteFormActions isEdit={isEdit} onCancel={onCancel} />
        </div>
      </div>
    </MobileFormWrapper>
  );
};

export default ClienteForm;