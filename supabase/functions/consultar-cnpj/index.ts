
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CNPJConsultaRequest {
  cnpj: string;
}

interface CNPJResponse {
  success: boolean;
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  situacao?: string;
  tipo?: string;
  porte?: string;
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  atividade_principal?: Array<{
    code: string;
    text: string;
  }>;
  error?: string;
}

const consultarCNPJReceitaFederal = async (cnpj: string): Promise<CNPJResponse> => {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  try {
    // Primeira tentativa: usar a API da ReceitaWS
    const receitaWsResponse = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (receitaWsResponse.ok) {
      const data = await receitaWsResponse.json();
      
      if (data.status !== 'ERROR' && data.cnpj) {
        return {
          success: true,
          cnpj: data.cnpj,
          razao_social: data.nome || 'Não informado',
          nome_fantasia: data.fantasia || '',
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
          atividade_principal: data.atividade_principal ? 
            [{ code: data.atividade_principal[0]?.code || '', text: data.atividade_principal[0]?.text || 'Não informado' }] : 
            [{ code: '', text: 'Não informado' }]
        };
      }
    }

    // Segunda tentativa: API alternativa
    const alternativeResponse = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (alternativeResponse.ok) {
      const data = await alternativeResponse.json();
      
      return {
        success: true,
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

    return {
      success: false,
      cnpj: cnpjLimpo,
      error: 'CNPJ não encontrado ou APIs indisponíveis'
    };

  } catch (error) {
    console.error('Erro na consulta do CNPJ:', error);
    return {
      success: false,
      cnpj: cnpjLimpo,
      error: 'Erro ao consultar CNPJ - APIs indisponíveis'
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cnpj }: CNPJConsultaRequest = await req.json();

    if (!cnpj) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'CNPJ é obrigatório'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resultado = await consultarCNPJReceitaFederal(cnpj);

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função consultar-cnpj:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
