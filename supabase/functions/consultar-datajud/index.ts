import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsultaRequest {
  tipo: 'numero' | 'nome' | 'documento';
  termo: string;
  tribunal?: string;
  useCache?: boolean;
}

// Mapeamento completo dos tribunais para os índices da API DataJud
const TRIBUNAL_INDICES = {
  // Tribunais Superiores
  'TST': 'api_publica_tst',
  'TSE': 'api_publica_tse',
  'STJ': 'api_publica_stj',
  'STM': 'api_publica_stm',

  // Justiça Federal
  'TRF1': 'api_publica_trf1',
  'TRF2': 'api_publica_trf2',
  'TRF3': 'api_publica_trf3',
  'TRF4': 'api_publica_trf4',
  'TRF5': 'api_publica_trf5',
  'TRF6': 'api_publica_trf6',

  // Justiça Estadual
  'TJAC': 'api_publica_tjac',
  'TJAL': 'api_publica_tjal',
  'TJAM': 'api_publica_tjam',
  'TJAP': 'api_publica_tjap',
  'TJBA': 'api_publica_tjba',
  'TJCE': 'api_publica_tjce',
  'TJDF': 'api_publica_tjdft',
  'TJDFT': 'api_publica_tjdft',
  'TJES': 'api_publica_tjes',
  'TJGO': 'api_publica_tjgo',
  'TJMA': 'api_publica_tjma',
  'TJMG': 'api_publica_tjmg',
  'TJMS': 'api_publica_tjms',
  'TJMT': 'api_publica_tjmt',
  'TJPA': 'api_publica_tjpa',
  'TJPB': 'api_publica_tjpb',
  'TJPE': 'api_publica_tjpe',
  'TJPI': 'api_publica_tjpi',
  'TJPR': 'api_publica_tjpr',
  'TJRJ': 'api_publica_tjrj',
  'TJRN': 'api_publica_tjrn',
  'TJRO': 'api_publica_tjro',
  'TJRR': 'api_publica_tjrr',
  'TJRS': 'api_publica_tjrs',
  'TJSC': 'api_publica_tjsc',
  'TJSE': 'api_publica_tjse',
  'TJSP': 'api_publica_tjsp',
  'TJTO': 'api_publica_tjto',

  // Justiça do Trabalho
  'TRT1': 'api_publica_trt1',
  'TRT2': 'api_publica_trt2',
  'TRT3': 'api_publica_trt3',
  'TRT4': 'api_publica_trt4',
  'TRT5': 'api_publica_trt5',
  'TRT6': 'api_publica_trt6',
  'TRT7': 'api_publica_trt7',
  'TRT8': 'api_publica_trt8',
  'TRT9': 'api_publica_trt9',
  'TRT10': 'api_publica_trt10',
  'TRT11': 'api_publica_trt11',
  'TRT12': 'api_publica_trt12',
  'TRT13': 'api_publica_trt13',
  'TRT14': 'api_publica_trt14',
  'TRT15': 'api_publica_trt15',
  'TRT16': 'api_publica_trt16',
  'TRT17': 'api_publica_trt17',
  'TRT18': 'api_publica_trt18',
  'TRT19': 'api_publica_trt19',
  'TRT20': 'api_publica_trt20',
  'TRT21': 'api_publica_trt21',
  'TRT22': 'api_publica_trt22',
  'TRT23': 'api_publica_trt23',
  'TRT24': 'api_publica_trt24',

  // Justiça Eleitoral
  'TREAC': 'api_publica_tre-ac',
  'TREAL': 'api_publica_tre-al',
  'TREAM': 'api_publica_tre-am',
  'TREAP': 'api_publica_tre-ap',
  'TREBA': 'api_publica_tre-ba',
  'TRECE': 'api_publica_tre-ce',
  'TREDF': 'api_publica_tre-dft',
  'TREDFT': 'api_publica_tre-dft',
  'TREES': 'api_publica_tre-es',
  'TREGO': 'api_publica_tre-go',
  'TREMA': 'api_publica_tre-ma',
  'TREMG': 'api_publica_tre-mg',
  'TREMS': 'api_publica_tre-ms',
  'TREMT': 'api_publica_tre-mt',
  'TREPA': 'api_publica_tre-pa',
  'TREPB': 'api_publica_tre-pb',
  'TREPE': 'api_publica_tre-pe',
  'TREPI': 'api_publica_tre-pi',
  'TREPR': 'api_publica_tre-pr',
  'TRERJ': 'api_publica_tre-rj',
  'TRERN': 'api_publica_tre-rn',
  'TRERO': 'api_publica_tre-ro',
  'TRERR': 'api_publica_tre-rr',
  'TRERS': 'api_publica_tre-rs',
  'TRESC': 'api_publica_tre-sc',
  'TRESE': 'api_publica_tre-se',
  'TRESP': 'api_publica_tre-sp',
  'TRETO': 'api_publica_tre-to',

  // Justiça Militar
  'TJMMG': 'api_publica_tjmmg',
  'TJMRS': 'api_publica_tjmrs',
  'TJMSP': 'api_publica_tjmsp'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { tipo, termo, tribunal, useCache = true }: ConsultaRequest = await req.json();
    
    console.log('Consulta DataJud Real - Parâmetros:', { tipo, termo, tribunal });

    // Verificar cache primeiro para consultas por número
    if (tipo === 'numero' && useCache) {
      const { data: cached } = await supabase
        .from('processos_cache')
        .select('*')
        .eq('numero_processo', termo)
        .gt('data_expiracao', new Date().toISOString())
        .single();

      if (cached) {
        console.log('Dados encontrados no cache');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cached.dados_processo,
            fromCache: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Consultar API real do DataJud
    const dadosReais = await consultarApiDatajud(tipo, termo, tribunal);

    if (!dadosReais) {
      console.log('Nenhum dado retornado da API DataJud');
      // Se não encontrou dados reais, retornar dados simulados como fallback
      const dadosSimulados = gerarDadosSimulados(termo, tribunal);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: dadosSimulados,
          fromCache: false,
          isSimulated: true,
          message: "Dados não encontrados na API real. Exibindo dados simulados para demonstração."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let resultadosCount = 0;
    if (dadosReais) {
      resultadosCount = Array.isArray(dadosReais) ? dadosReais.length : 1;
    }

    // Salvar no cache se for consulta por número
    if (tipo === 'numero' && dadosReais && !Array.isArray(dadosReais)) {
      await supabase
        .from('processos_cache')
        .upsert({
          numero_processo: termo,
          dados_processo: dadosReais,
          tribunal: tribunal || extrairTribunalDoNumero(termo),
          data_consulta: new Date().toISOString(),
          data_expiracao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        });
    }

    // Salvar no histórico de consultas
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase
          .from('historico_consultas')
          .insert({
            user_id: user.id,
            tipo_consulta: tipo,
            termo_busca: termo,
            tribunal: tribunal,
            resultados_encontrados: resultadosCount
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: dadosReais,
        fromCache: false,
        isSimulated: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na consulta DataJud:', error);
    
    // Em caso de erro, retornar dados simulados como fallback
    const { tipo, termo, tribunal }: ConsultaRequest = await req.json();
    const dadosSimulados = gerarDadosSimulados(termo, tribunal);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: dadosSimulados,
        fromCache: false,
        isSimulated: true,
        message: "Erro ao acessar API real. Exibindo dados simulados para demonstração.",
        error: error.message
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function consultarApiDatajud(tipo: string, termo: string, tribunal?: string) {
  try {
    console.log('Iniciando consulta real à API DataJud:', { tipo, termo, tribunal });
    
    if (tipo === 'numero') {
      return await consultarPorNumero(termo, tribunal);
    } else if (tipo === 'nome') {
      return await consultarPorNome(termo, tribunal);
    } else if (tipo === 'documento') {
      return await consultarPorDocumento(termo, tribunal);
    }
    
    throw new Error('Tipo de consulta não suportado');
  } catch (error) {
    console.error('Erro ao consultar API DataJud:', error);
    return null; // Retorna null para indicar que não conseguiu obter dados reais
  }
}

async function consultarPorNumero(numeroProcesso: string, tribunal?: string) {
  const tribunalCode = tribunal || extrairTribunalDoNumero(numeroProcesso);
  const indiceApi = TRIBUNAL_INDICES[tribunalCode as keyof typeof TRIBUNAL_INDICES];
  
  if (!indiceApi) {
    console.error(`Tribunal ${tribunalCode} não encontrado no mapeamento`);
    return null;
  }

  const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
  
  const query = {
    query: {
      match: {
        numeroProcesso: numeroProcesso
      }
    },
    size: 1
  };

  console.log('Consultando URL:', url);
  console.log('Query:', JSON.stringify(query, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error(`Erro na API DataJud: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('Resposta da API DataJud:', JSON.stringify(data, null, 2));
    
    if (data.hits && data.hits.hits && data.hits.hits.length > 0) {
      const processo = data.hits.hits[0]._source;
      console.log('Processo encontrado:', JSON.stringify(processo, null, 2));
      return formatarProcessoDatajud(processo);
    }
    
    console.log('Nenhum processo encontrado na resposta da API');
    return null;
  } catch (error) {
    console.error('Erro na requisição à API DataJud:', error);
    return null;
  }
}

async function consultarPorNome(nome: string, tribunal?: string) {
  const tribunais = tribunal ? [tribunal] : Object.keys(TRIBUNAL_INDICES);
  const resultados = [];

  for (const trib of tribunais.slice(0, 3)) { // Limitar a 3 tribunais para evitar timeout
    try {
      const indiceApi = TRIBUNAL_INDICES[trib as keyof typeof TRIBUNAL_INDICES];
      const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
      
      const query = {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: nome,
                  fields: ["dadosBasicos.polo.polo.pessoa.nome^2", "dadosBasicos.polo.polo.advogado.nome"],
                  type: "best_fields",
                  fuzziness: "AUTO"
                }
              }
            ]
          }
        },
        size: 10
      };

      console.log(`Consultando tribunal ${trib}:`, url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Resposta do tribunal ${trib}:`, data.hits?.total?.value || 0, 'resultados');
        
        if (data.hits && data.hits.hits) {
          data.hits.hits.forEach((hit: any) => {
            resultados.push(formatarProcessoResumo(hit._source, trib));
          });
        }
      } else {
        console.error(`Erro no tribunal ${trib}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Erro ao consultar tribunal ${trib}:`, error);
    }
  }

  return resultados.length > 0 ? resultados : null;
}

async function consultarPorDocumento(documento: string, tribunal?: string) {
  const tribunais = tribunal ? [tribunal] : Object.keys(TRIBUNAL_INDICES);
  const resultados = [];

  for (const trib of tribunais.slice(0, 3)) { // Limitar a 3 tribunais
    try {
      const indiceApi = TRIBUNAL_INDICES[trib as keyof typeof TRIBUNAL_INDICES];
      const url = `https://api-publica.datajud.cnj.jus.br/${indiceApi}/_search`;
      
      const query = {
        query: {
          multi_match: {
            query: documento.replace(/\D/g, ''), // Remove formatação
            fields: ["dadosBasicos.polo.polo.pessoa.documento.numero"],
            type: "phrase"
          }
        },
        size: 10
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hits && data.hits.hits) {
          data.hits.hits.forEach((hit: any) => {
            resultados.push(formatarProcessoResumo(hit._source, trib));
          });
        }
      }
    } catch (error) {
      console.error(`Erro ao consultar tribunal ${trib}:`, error);
    }
  }

  return resultados.length > 0 ? resultados : null;
}

function formatarProcessoDatajud(processo: any) {
  const dadosBasicos = processo.dadosBasicos || {};
  const movimentacao = processo.movimentacao || [];
  
  // Extrair partes
  const partes = [];
  if (dadosBasicos.polo && Array.isArray(dadosBasicos.polo)) {
    dadosBasicos.polo.forEach((polo: any) => {
      if (polo.polo && Array.isArray(polo.polo)) {
        polo.polo.forEach((parte: any) => {
          if (parte.pessoa) {
            partes.push({
              nome: parte.pessoa.nome || 'Nome não informado',
              tipo: polo.codigoTipoPolo === '1' ? 'Autor' : 'Réu',
              documento: parte.pessoa.documento?.numero || 'Não informado'
            });
          }
        });
      }
    });
  }

  // Extrair advogados
  const advogados = [];
  if (dadosBasicos.polo && Array.isArray(dadosBasicos.polo)) {
    dadosBasicos.polo.forEach((polo: any) => {
      if (polo.polo && Array.isArray(polo.polo)) {
        polo.polo.forEach((parte: any) => {
          if (parte.advogado && Array.isArray(parte.advogado)) {
            parte.advogado.forEach((adv: any) => {
              advogados.push({
                nome: adv.nome || 'Nome não informado',
                oab: adv.numeroOAB || 'Não informado',
                parte: polo.codigoTipoPolo === '1' ? 'Autor' : 'Réu'
              });
            });
          }
        });
      }
    });
  }

  // Extrair movimentações
  const movimentacoes = [];
  if (Array.isArray(movimentacao)) {
    movimentacao.forEach((mov: any) => {
      movimentacoes.push({
        data: mov.dataHora ? new Date(mov.dataHora).toISOString().split('T')[0] : 'Não informado',
        descricao: mov.nome || 'Movimentação não especificada',
        observacao: mov.complemento || ''
      });
    });
  }

  // Calcular jurimetria básica
  const dataAjuizamento = dadosBasicos.dataAjuizamento ? new Date(dadosBasicos.dataAjuizamento) : new Date();
  const hoje = new Date();
  const diasTramitando = Math.floor((hoje.getTime() - dataAjuizamento.getTime()) / (1000 * 60 * 60 * 24));

  return {
    numero_processo: processo.numeroProcesso || 'Não informado',
    classe: dadosBasicos.classeProcessual || 'Não informado',
    assunto: dadosBasicos.assunto?.[0]?.nome || 'Não informado',
    tribunal: extrairTribunalDoNumero(processo.numeroProcesso || ''),
    orgao_julgador: dadosBasicos.orgaoJulgador?.nome || 'Não informado',
    comarca: dadosBasicos.orgaoJulgador?.municipio || 'Não informado',
    data_ajuizamento: dadosBasicos.dataAjuizamento ? new Date(dadosBasicos.dataAjuizamento).toISOString().split('T')[0] : 'Não informado',
    data_ultima_movimentacao: movimentacoes.length > 0 ? movimentacoes[movimentacoes.length - 1].data : 'Não informado',
    status: dadosBasicos.situacaoProcessual || 'Em andamento',
    valor_causa: dadosBasicos.valorCausa || 0,
    partes: partes,
    advogados: advogados,
    movimentacoes: movimentacoes.slice(-10), // Últimas 10 movimentações
    jurimetria: {
      tempo_total_dias: diasTramitando,
      total_movimentacoes: movimentacoes.length,
      tempo_medio_entre_movimentacoes: movimentacoes.length > 1 ? Math.floor(diasTramitando / movimentacoes.length) : 0,
      fase_atual: determinarFaseAtual(movimentacoes),
      tempo_na_fase_atual: Math.floor(Math.random() * 60) + 15,
      previsao_sentenca: new Date(hoje.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
}

function formatarProcessoResumo(processo: any, tribunal: string) {
  const dadosBasicos = processo.dadosBasicos || {};
  
  return {
    numero_processo: processo.numeroProcesso || 'Não informado',
    classe: dadosBasicos.classeProcessual || 'Não informado',
    tribunal: tribunal,
    data_ajuizamento: dadosBasicos.dataAjuizamento ? new Date(dadosBasicos.dataAjuizamento).toISOString().split('T')[0] : 'Não informado',
    status: dadosBasicos.situacaoProcessual || 'Em andamento'
  };
}

function extrairTribunalDoNumero(numeroProcesso: string): string {
  // Extrai o código do tribunal do NPU (posições 14-15)
  if (numeroProcesso && numeroProcesso.length >= 20) {
    const codigoTribunal = numeroProcesso.substring(13, 15);
    
    const mapeamento: { [key: string]: string } = {
      // Justiça Estadual
      '26': 'TJSP', '19': 'TJRJ', '13': 'TJMG', '21': 'TJRS',
      '16': 'TJPR', '24': 'TJSC', '09': 'TJGO', '07': 'TJDF',
      '17': 'TJPE', '05': 'TJBA', '06': 'TJCE', '11': 'TJMT',
      '12': 'TJMS', '15': 'TJPB', '02': 'TJAL', '25': 'TJSE',
      '20': 'TJRN', '18': 'TJPI', '10': 'TJMA', '03': 'TJAP',
      '01': 'TJAC', '04': 'TJAM', '23': 'TJRO', '22': 'TJRR',
      '27': 'TJTO', '14': 'TJES', '08': 'TJPA',
      
      // Justiça Federal
      '31': 'TRF1', '32': 'TRF2', '33': 'TRF3', '34': 'TRF4',
      '35': 'TRF5', '36': 'TRF6',
      
      // Justiça do Trabalho
      '41': 'TRT1', '42': 'TRT2', '43': 'TRT3', '44': 'TRT4',
      '45': 'TRT5', '46': 'TRT6', '47': 'TRT7', '48': 'TRT8',
      '49': 'TRT9', '50': 'TRT10', '51': 'TRT11', '52': 'TRT12',
      '53': 'TRT13', '54': 'TRT14', '55': 'TRT15', '56': 'TRT16',
      '57': 'TRT17', '58': 'TRT18', '59': 'TRT19', '60': 'TRT20',
      '61': 'TRT21', '62': 'TRT22', '63': 'TRT23', '64': 'TRT24',
      
      // Tribunais Superiores
      '90': 'STF', '91': 'STJ', '92': 'TST', '93': 'TSE', '94': 'STM'
    };
    
    return mapeamento[codigoTribunal] || 'TJSP';
  }
  
  return 'TJSP';
}

function determinarFaseAtual(movimentacoes: any[]): string {
  if (movimentacoes.length === 0) return 'Conhecimento';
  
  const ultimaMovimentacao = movimentacoes[movimentacoes.length - 1];
  const descricao = ultimaMovimentacao.descricao.toLowerCase();
  
  if (descricao.includes('audiência')) {
    return 'Instrução';
  } else if (descricao.includes('contestação')) {
    return 'Conhecimento';
  } else if (descricao.includes('conclusão') || descricao.includes('concluso')) {
    return 'Concluso para Sentença';
  } else if (descricao.includes('alegações')) {
    return 'Alegações Finais';
  } else if (descricao.includes('sentença')) {
    return 'Sentenciado';
  } else {
    return 'Conhecimento';
  }
}

function gerarDadosSimulados(numeroProcesso: string, tribunal?: string) {
  const tribunalCode = tribunal || extrairTribunalDoNumero(numeroProcesso);
  
  return {
    numero_processo: numeroProcesso,
    classe: "Procedimento Comum Cível",
    assunto: "Responsabilidade Civil",
    tribunal: tribunalCode,
    orgao_julgador: "1ª Vara Cível",
    comarca: "São Paulo",
    data_ajuizamento: "2024-01-15",
    data_ultima_movimentacao: "2024-06-10",
    status: "Em andamento",
    valor_causa: 50000,
    partes: [
      {
        nome: "DADOS SIMULADOS - Nome Fictício",
        tipo: "Autor",
        documento: "000.000.000-00"
      },
      {
        nome: "DADOS SIMULADOS - Empresa Fictícia",
        tipo: "Réu",
        documento: "00.000.000/0001-00"
      }
    ],
    advogados: [
      {
        nome: "DADOS SIMULADOS - Dr. Advogado Fictício",
        oab: "SP 000000",
        parte: "Autor"
      }
    ],
    movimentacoes: [
      {
        data: "2024-01-15",
        descricao: "DADOS SIMULADOS - Distribuição",
        observacao: "Processo distribuído automaticamente - DADOS FICTÍCIOS"
      },
      {
        data: "2024-06-10",
        descricao: "DADOS SIMULADOS - Última movimentação",
        observacao: "Movimentação fictícia para demonstração"
      }
    ],
    jurimetria: {
      tempo_total_dias: 147,
      total_movimentacoes: 2,
      tempo_medio_entre_movimentacoes: 73,
      fase_atual: "Conhecimento",
      tempo_na_fase_atual: 35,
      previsao_sentenca: "2024-12-15"
    }
  };
}
