
import type { ClienteFormData } from './types';

export const prepareClientDataForSave = (clientData: ClienteFormData): any => {
  const dataToSave: any = {
    nome: clientData.nome,
    email: clientData.email || '', // Sempre enviar string, mesmo que vazia
    telefone: clientData.telefone || '',
    tipo_cliente: clientData.tipo_cliente,
    cpfCnpj: clientData.cpfCnpj,
    status_cliente: clientData.status_cliente,
    endereco: clientData.endereco || '',
    cidade: clientData.cidade || '',
    estado: clientData.estado || '',
    cep: clientData.cep || '',
    observacoes: clientData.observacoes || ''
  };

  return dataToSave;
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
