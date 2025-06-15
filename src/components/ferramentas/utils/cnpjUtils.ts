
import { supabase } from '@/integrations/supabase/client';

export const formatCNPJ = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length <= 14) {
    return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return digitsOnly.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  tipo: string;
  porte: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
}

export const consultarCNPJAPI = async (cnpj: string): Promise<CNPJData> => {
  try {
    const { data, error } = await supabase.functions.invoke('consultar-cnpj', {
      body: {
        cnpj: cnpj
      }
    });

    if (error) {
      console.error('Erro ao chamar função edge:', error);
      throw new Error(error.message || 'Erro ao consultar CNPJ');
    }

    if (!data.success) {
      throw new Error(data.error || 'CNPJ não encontrado');
    }

    return {
      cnpj: data.cnpj,
      razao_social: data.razao_social || 'Não informado',
      nome_fantasia: data.nome_fantasia || '',
      situacao: data.situacao || 'Não informado',
      tipo: data.tipo || 'Não informado',
      porte: data.porte || 'Não informado',
      natureza_juridica: data.natureza_juridica || 'Não informado',
      logradouro: data.logradouro || 'Não informado',
      numero: data.numero || '',
      municipio: data.municipio || 'Não informado',
      uf: data.uf || 'Não informado',
      cep: data.cep || 'Não informado',
      telefone: data.telefone || 'Não informado',
      email: data.email || 'Não informado',
      atividade_principal: data.atividade_principal || [{ code: '', text: 'Não informado' }]
    };
  } catch (error) {
    console.error('Erro na consulta do CNPJ:', error);
    throw new Error('Não foi possível consultar o CNPJ');
  }
};
