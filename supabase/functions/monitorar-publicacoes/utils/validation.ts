
export const validateUserInput = (input: any) => {
  const errors: string[] = [];
  
  if (!input.user_id || typeof input.user_id !== 'string') {
    errors.push('Invalid user_id');
  }
  
  if (!Array.isArray(input.nomes) || input.nomes.length === 0) {
    errors.push('Invalid or empty nomes array');
  }
  
  if (input.nomes && input.nomes.some((nome: any) => typeof nome !== 'string' || nome.length > 100)) {
    errors.push('Invalid nome format or length');
  }
  
  if (input.estados && !Array.isArray(input.estados)) {
    errors.push('Invalid estados format');
  }
  
  if (input.palavras_chave && !Array.isArray(input.palavras_chave)) {
    errors.push('Invalid palavras_chave format');
  }
  
  return errors;
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"&]/g, '').trim();
};

export const sanitizeInputs = (body: any) => {
  const sanitizedNomes = body.nomes.map((nome: string) => sanitizeInput(nome)).filter((n: string) => n.length > 0);
  const sanitizedEstados = body.estados?.map((estado: string) => sanitizeInput(estado)).filter((e: string) => e.length > 0) || [];
  const sanitizedPalavrasChave = body.palavras_chave?.map((palavra: string) => sanitizeInput(palavra)).filter((p: string) => p.length > 0) || [];

  return {
    sanitizedNomes,
    sanitizedEstados,
    sanitizedPalavrasChave
  };
};
