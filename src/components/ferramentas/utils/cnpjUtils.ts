
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
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  // Primeira tentativa: ReceitaWS
  let response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
  
  if (response.ok) {
    const data = await response.json();
    if (data.status !== 'ERROR') {
      return data;
    }
  }

  // Segunda tentativa: API alternativa
  response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
  
  if (response.ok) {
    const data = await response.json();
    
    // Adapta os dados para o formato esperado
    return {
      cnpj: data.estabelecimento?.cnpj || cnpjLimpo,
      razao_social: data.razao_social || 'Não informado',
      nome_fantasia: data.estabelecimento?.nome_fantasia || '',
      situacao: data.estabelecimento?.situacao_cadastral || 'Não informado',
      tipo: data.natureza_juridica?.descricao || 'Não informado',
      porte: data.porte?.descricao || 'Não informado',
      natureza_juridica: data.natureza_juridica?.descricao || 'Não informado',
      logradouro: data.estabelecimento?.logradouro || 'Não informado',
      numero: data.estabelecimento?.numero || '',
      municipio: data.estabelecimento?.cidade?.nome || 'Não informado',
      uf: data.estabelecimento?.estado?.sigla || 'Não informado',
      cep: data.estabelecimento?.cep || 'Não informado',
      telefone: data.estabelecimento?.telefone1 || 'Não informado',
      email: data.estabelecimento?.email || 'Não informado',
      atividade_principal: data.estabelecimento?.atividade_principal ? 
        [{ code: data.estabelecimento.atividade_principal.id, text: data.estabelecimento.atividade_principal.descricao }] : 
        [{ code: '', text: 'Não informado' }]
    };
  }

  throw new Error('Todas as APIs falharam');
};
