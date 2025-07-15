
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
    
    // Preparar dados para salvar - campos opcionais podem ficar vazios
    const dataToSave: any = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim() || '',
      tipo_cliente: formData.tipo_cliente,
      cpfCnpj: formData.cpfCnpj.trim() || '',
      status_cliente: formData.status_cliente,
      // Campos opcionais 
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    };
    
    // Só incluir email se não estiver vazio - agora funciona com campo nullable
    if (formData.email && formData.email.trim()) {
      dataToSave.email = formData.email.trim();
    }
    
    console.log('Dados preparados para salvar:', dataToSave);
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
