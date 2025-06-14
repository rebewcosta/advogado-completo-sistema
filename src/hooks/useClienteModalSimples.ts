
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
    
    // Preparar dados para salvar - enviar string vazia em vez de omitir o email
    const dataToSave: any = {
      nome: formData.nome.trim(),
      email: formData.email.trim() || '', // Sempre enviar string, mesmo que vazia
      telefone: formData.telefone.trim(),
      tipo_cliente: formData.tipo_cliente,
      cpfCnpj: formData.cpfCnpj.trim(),
      status_cliente: formData.status_cliente,
      // Campos obrigatórios mas que podem estar vazios no modal simples
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    };
    
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
