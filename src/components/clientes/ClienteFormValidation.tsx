
import React from 'react';
import { useValidation } from '@/hooks/useValidation';
import { useToast } from '@/hooks/use-toast';

interface ClienteFormData {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
}

export const useClienteValidation = () => {
  const { validateInput, sanitizeText, isValidating } = useValidation();
  const { toast } = useToast();

  const validateCliente = async (data: ClienteFormData) => {
    // Sanitizar dados de entrada
    const sanitizedData = {
      ...data,
      nome: sanitizeText(data.nome),
      email: data.email ? sanitizeText(data.email) : '',
      endereco: data.endereco ? sanitizeText(data.endereco) : '',
      cidade: data.cidade ? sanitizeText(data.cidade) : '',
      observacoes: data.observacoes ? sanitizeText(data.observacoes) : ''
    };

    // Definir campos obrigatórios e limites - apenas nome é obrigatório
    const requiredFields = ['nome'];
    const maxLengths = {
      nome: 100,
      cpfCnpj: 18,
      telefone: 20,
      email: 100,
      endereco: 200,
      cidade: 50,
      estado: 2,
      cep: 10,
      observacoes: 500
    };

    // Validação no backend
    const validation = await validateInput(sanitizedData, requiredFields, maxLengths);

    // Validações específicas de cliente
    const customErrors: string[] = [];

    // Validar CPF/CNPJ apenas se foi fornecido
    if (data.cpfCnpj && data.cpfCnpj.trim()) {
      const cpfCnpjClean = data.cpfCnpj.replace(/\D/g, '');
      if (cpfCnpjClean.length !== 11 && cpfCnpjClean.length !== 14) {
        customErrors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }
    }

    // Validar email se fornecido
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      customErrors.push('Email deve ter formato válido');
    }

    // Validar telefone apenas se foi fornecido
    if (data.telefone && data.telefone.trim()) {
      const telefoneClean = data.telefone.replace(/\D/g, '');
      if (telefoneClean.length < 10 || telefoneClean.length > 11) {
        customErrors.push('Telefone deve ter 10 ou 11 dígitos');
      }
    }

    // Combinar erros
    const allErrors = [...(validation.errors || []), ...customErrors];

    if (allErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: allErrors[0],
        variant: "destructive"
      });
      return { valid: false, errors: allErrors, data: sanitizedData };
    }

    return { valid: true, errors: [], data: sanitizedData };
  };

  return {
    validateCliente,
    isValidating
  };
};
