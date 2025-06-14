
interface ValidationResult {
  isValid: boolean;
  error?: string;
  validatedData?: {
    userId: string;
    nomes: string[];
    estados: string[];
  };
}

export const validateMonitoringRequest = async (req: Request): Promise<ValidationResult> => {
  if (!req.body) {
    return {
      isValid: false,
      error: 'Request body é obrigatório'
    };
  }

  let body;
  try {
    const requestText = await req.text();
    
    if (!requestText || requestText.trim() === '') {
      return {
        isValid: false,
        error: 'Corpo da requisição está vazio'
      };
    }
    
    body = JSON.parse(requestText);
  } catch (parseError) {
    return {
      isValid: false,
      error: 'Formato JSON inválido'
    };
  }

  if (!body?.user_id || typeof body.user_id !== 'string') {
    return {
      isValid: false,
      error: 'ID do usuário é obrigatório'
    };
  }

  if (!Array.isArray(body?.nomes) || body.nomes.length === 0) {
    return {
      isValid: false,
      error: 'Lista de nomes é obrigatória'
    };
  }

  const nomesValidos = body.nomes
    .filter((nome: any) => typeof nome === 'string' && nome.trim().length > 0)
    .map((nome: string) => nome.trim());

  if (nomesValidos.length === 0) {
    return {
      isValid: false,
      error: 'Nenhum nome válido encontrado'
    };
  }

  const estadosValidos = Array.isArray(body.estados)
    ? body.estados
        .filter((estado: any) => typeof estado === 'string' && estado.trim().length > 0)
        .map((estado: string) => estado.trim().toUpperCase())
    : [];

  return {
    isValid: true,
    validatedData: {
      userId: body.user_id,
      nomes: nomesValidos,
      estados: estadosValidos
    }
  };
};
