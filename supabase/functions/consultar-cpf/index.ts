
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CPFConsultaRequest {
  cpf: string;
  dataNascimento: string;
}

interface CPFResponse {
  valid: boolean;
  formatted: string;
  nome?: string;
  situacao?: string;
  nascimento?: string;
  descricao_situacao?: string;
}

const validarCPF = (cpfString: string): boolean => {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cpf, dataNascimento }: CPFConsultaRequest = await req.json();

    if (!cpf || !dataNascimento) {
      return new Response(
        JSON.stringify({ 
          error: 'CPF e data de nascimento são obrigatórios',
          valid: false 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isValid = validarCPF(cpf);
    
    // Para CPF, mantemos apenas a validação local por enquanto
    // pois a consulta online na Receita Federal é mais complexa
    const resultado: CPFResponse = {
      valid: isValid,
      formatted: cpf,
      nascimento: dataNascimento,
      situacao: isValid ? 'CPF válido (validação local)' : 'CPF inválido',
      descricao_situacao: isValid ? 
        'CPF passou na validação dos dígitos verificadores' : 
        'CPF não passou na validação dos dígitos verificadores'
    };

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função consultar-cpf:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        valid: false,
        descricao_situacao: 'Erro ao processar consulta do CPF'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
