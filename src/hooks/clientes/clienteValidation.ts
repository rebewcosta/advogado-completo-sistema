
import type { ClienteFormData } from './types';

export const prepareClientDataForSave = (clientData: ClienteFormData): any => {
  return {
    ...clientData,
    // Se email estiver vazio, não enviar o campo para evitar conflito de unique constraint
    ...(clientData.email && clientData.email.trim() ? { email: clientData.email.trim() } : {}),
    telefone: clientData.telefone || '',
    endereco: clientData.endereco || '',
    cidade: clientData.cidade || '',
    estado: clientData.estado || '',
    cep: clientData.cep || '',
    observacoes: clientData.observacoes || ''
  };
};

export const getErrorMessage = (error: any): string => {
  if (error.message?.includes('clientes_email_key')) {
    return "Este email já está cadastrado para outro cliente.";
  } else if (error.message?.includes('duplicate key')) {
    return "Já existe um cliente com essas informações.";
  } else if (error.message?.includes('not-null constraint')) {
    return "Todos os campos obrigatórios devem ser preenchidos.";
  } else if (error.message) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
};
