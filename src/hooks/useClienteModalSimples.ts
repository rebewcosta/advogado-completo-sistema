
import { useState } from 'react';

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo_cliente: string;
  cpfCnpj: string;
  status_cliente: string;
}

export const useClienteModalSimples = (onSaveCliente: (clienteData: any) => void) => {
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    email: '',
    telefone: '',
    tipo_cliente: 'Pessoa Física',
    cpfCnpj: '',
    status_cliente: 'Ativo'
  });

  const handleFieldChange = (field: keyof ClienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do cliente.');
      return;
    }
    
    // Preparar dados, removendo email se estiver vazio para evitar conflito
    const dataToSave = {
      ...formData,
      // Só incluir email se não estiver vazio
      ...(formData.email && formData.email.trim() ? { email: formData.email.trim() } : {})
    };
    
    onSaveCliente(dataToSave);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      tipo_cliente: 'Pessoa Física',
      cpfCnpj: '',
      status_cliente: 'Ativo'
    });
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    resetForm
  };
};
