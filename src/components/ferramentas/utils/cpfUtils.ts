
import { supabase } from '@/integrations/supabase/client';

export const formatCPF = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length <= 11) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return digitsOnly.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatDate = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length <= 8) {
    return digitsOnly.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  }
  return digitsOnly.slice(0, 8).replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
};

export const validarCPF = (cpfString: string): boolean => {
  const cpfDigits = cpfString.replace(/\D/g, '');
  
  if (cpfDigits.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfDigits)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfDigits.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfDigits.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.charAt(10))) return false;
  
  return true;
};

export interface CPFData {
  valid: boolean;
  formatted: string;
  nome?: string;
  situacao?: string;
  nascimento?: string;
  genero?: string;
  digito_verificador?: string;
  codigo_situacao?: string;
  descricao_situacao?: string;
}

export const consultarCPFAPI = async (cpf: string, dataNascimento: string): Promise<CPFData> => {
  try {
    const { data, error } = await supabase.functions.invoke('consultar-cpf', {
      body: {
        cpf: cpf,
        dataNascimento: dataNascimento
      }
    });

    if (error) {
      console.error('Erro ao chamar função edge:', error);
      throw new Error(error.message || 'Erro ao consultar CPF');
    }

    return data as CPFData;
  } catch (error) {
    console.error('Erro na consulta do CPF:', error);
    
    // Fallback para validação local em caso de erro
    const isValid = validarCPF(cpf);
    return {
      valid: isValid,
      formatted: cpf,
      nascimento: dataNascimento,
      situacao: isValid ? 'CPF válido (consulta offline)' : 'CPF inválido',
      descricao_situacao: 'Erro na consulta - Validação realizada localmente'
    };
  }
};
