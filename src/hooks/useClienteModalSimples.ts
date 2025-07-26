
import { useState } from 'react';

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo_cliente: string;
  cpfCnpj: string;
  status_cliente: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes: string;
}

export const useClienteModalSimples = (onSaveCliente: (clienteData: any) => void) => {
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    email: '',
    telefone: '',
    tipo_cliente: 'Pessoa Física',
    cpfCnpj: '',
    status_cliente: 'Ativo',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
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
    
    // Preparar dados para salvar - enviar null para campos vazios
    const dataToSave: any = {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim() || null,
      tipo_cliente: formData.tipo_cliente,
      cpfCnpj: formData.cpfCnpj.trim() || null,
      status_cliente: formData.status_cliente,
      endereco: formData.endereco.trim() || null,
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim() || null,
      cep: formData.cep.trim() || null,
      observacoes: formData.observacoes.trim() || null
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
      status_cliente: 'Ativo',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      observacoes: ''
    });
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    resetForm
  };
};
