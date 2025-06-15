
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

const consultarReceitaFederal = async (cpf: string, dataNascimento: string): Promise<CPFResponse> => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  const dataLimpa = dataNascimento.replace(/\D/g, '');
  
  // Primeira validação local
  const isValid = validarCPF(cpf);
  if (!isValid) {
    return {
      valid: false,
      formatted: cpf,
      descricao_situacao: 'CPF inválido - não passou na validação dos dígitos verificadores'
    };
  }

  try {
    // Formatar data para o formato esperado pela Receita Federal
    const dataFormatada = `${dataLimpa.slice(0,2)}${dataLimpa.slice(2,4)}${dataLimpa.slice(4,8)}`;
    
    // Tentar consulta na Receita Federal
    const formData = new URLSearchParams();
    formData.append('txtCPF', cpfLimpo);
    formData.append('txtDataNascimento', dataFormatada);
    formData.append('Submit', 'Consultar');
    
    const response = await fetch('https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });

    if (response.ok) {
      const htmlText = await response.text();
      console.log('Resposta da Receita Federal obtida');
      
      // Parse simples do HTML de resposta
      const nomeMatch = htmlText.match(/Nome:\s*([^<\n\r]+)/i);
      const situacaoMatch = htmlText.match(/Situação:\s*([^<\n\r]+)/i);
      const erroMatch = htmlText.match(/CPF não encontrado|Dados não conferem|inválido/i);
      
      if (erroMatch) {
        return {
          valid: false,
          formatted: cpf,
          nascimento: dataNascimento,
          descricao_situacao: 'CPF ou data de nascimento não conferem com os dados da Receita Federal'
        };
      }
      
      return {
        valid: true,
        formatted: cpf,
        nome: nomeMatch ? nomeMatch[1].trim() : 'Consulta realizada com sucesso',
        situacao: situacaoMatch ? situacaoMatch[1].trim() : 'Regular',
        nascimento: dataNascimento,
        descricao_situacao: 'Dados consultados na Receita Federal'
      };
    } else {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
  } catch (error) {
    console.log('Erro na consulta da Receita Federal:', error);
    
    // Fallback: validação local
    return {
      valid: isValid,
      formatted: cpf,
      nascimento: dataNascimento,
      situacao: isValid ? 'CPF válido (consulta offline)' : 'CPF inválido',
      descricao_situacao: 'Validação realizada localmente - API da Receita Federal indisponível'
    };
  }
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

    const resultado = await consultarReceitaFederal(cpf, dataNascimento);

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
