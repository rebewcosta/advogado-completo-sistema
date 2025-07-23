import React, { useState, useEffect } from 'react';
import ClienteFormHeader from '@/components/clientes/ClienteFormHeader';
import ClienteFormFields from '@/components/clientes/ClienteFormFields';
import ClienteFormActions from '@/components/clientes/ClienteFormActions';
import { useClienteValidation } from '@/components/clientes/ClienteFormValidation';

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed)', 
        padding: '16px', 
        margin: '16px', 
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <ClienteFormHeader isEdit={isEdit} onClose={onCancel} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <ClienteFormFields
            formData={formData}
            onChange={handleFieldChange}
          />
        </div>

        {/* Actions */}
        <div style={{ 
          background: 'linear-gradient(90deg, #2563eb, #4f46e5, #7c3aed)', 
          padding: '16px', 
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <ClienteFormActions isEdit={isEdit} onCancel={onCancel} />
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;