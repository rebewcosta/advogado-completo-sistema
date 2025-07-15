
import type { ClienteFormData } from './types';

export const prepareClientDataForSave = (clientData: ClienteFormData): any => {
  const dataToSave: any = {
    nome: clientData.nome,
    telefone: clientData.telefone || '',
    tipo_cliente: clientData.tipo_cliente,
    cpfCnpj: clientData.cpfCnpj || '',
    status_cliente: clientData.status_cliente,
    endereco: clientData.endereco || '',
    cidade: clientData.cidade || '',
    estado: clientData.estado || '',
    cep: clientData.cep || '',
    observacoes: clientData.observacoes || ''
  };

  // Só incluir email se não estiver vazio - agora o campo permite null no banco
  if (clientData.email && clientData.email.trim()) {
    dataToSave.email = clientData.email.trim();
  }

  return dataToSave;
};

export const getErrorMessage = (error: any): string => {
  if (error.message?.includes('clientes_email_key')) {
    return "Este email já está cadastrado para outro cliente.";
  } else if (error.message?.includes('clientes_cpfCnpj_key') || error.message?.includes('Já existe um cliente cadastrado com este CPF/CNPJ')) {
    return "Já existe um cliente cadastrado com este CPF/CNPJ para sua conta.";
  } else if (error.message?.includes('duplicate key')) {
    return "Já existe um cliente com essas informações.";
  } else if (error.message?.includes('not-null constraint')) {
    return "Todos os campos obrigatórios devem ser preenchidos.";
  } else if (error.message) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
};
