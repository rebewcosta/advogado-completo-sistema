
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
    
    console.log('Consulta DataJud:', { tipo, termo, tribunal });

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

    // Simular consulta à API DataJud (em produção, usar API real do CNJ)
    const dadosSimulados = await simularConsultaDatajud(tipo, termo, tribunal);

    // Salvar no cache se for consulta por número
    if (tipo === 'numero' && dadosSimulados) {
      await supabase
        .from('processos_cache')
        .upsert({
          numero_processo: termo,
          dados_processo: dadosSimulados,
          tribunal: tribunal || dadosSimulados.tribunal,
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
            resultados_encontrados: dadosSimulados ? 1 : 0
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: dadosSimulados,
        fromCache: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na consulta DataJud:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno na consulta' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function simularConsultaDatajud(tipo: string, termo: string, tribunal?: string) {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (tipo === 'numero') {
    return {
      numero_processo: termo,
      classe: 'Procedimento Comum Cível',
      assunto: 'Responsabilidade Civil',
      tribunal: tribunal || 'TJSP',
      orgao_julgador: '1ª Vara Cível',
      comarca: 'São Paulo',
      data_ajuizamento: '2024-01-15',
      data_ultima_movimentacao: '2024-06-10',
      status: 'Em andamento',
      valor_causa: 50000.00,
      partes: [
        { nome: 'João da Silva Santos', tipo: 'Autor', documento: '123.456.789-00' },
        { nome: 'Maria Oliveira Lima', tipo: 'Réu', documento: '987.654.321-00' }
      ],
      advogados: [
        { nome: 'Dr. Carlos Advocacia', oab: 'SP 123456', parte: 'Autor' },
        { nome: 'Dra. Ana Jurídica', oab: 'SP 654321', parte: 'Réu' }
      ],
      movimentacoes: [
        {
          data: '2024-01-15',
          descricao: 'Distribuição',
          observacao: 'Processo distribuído automaticamente'
        },
        {
          data: '2024-01-20',
          descricao: 'Citação',
          observacao: 'Citação da parte requerida'
        },
        {
          data: '2024-02-05',
          descricao: 'Contestação',
          observacao: 'Apresentada contestação pela parte requerida'
        },
        {
          data: '2024-02-20',
          descricao: 'Despacho',
          observacao: 'Determina especificação de provas'
        },
        {
          data: '2024-03-10',
          descricao: 'Manifestação',
          observacao: 'Partes especificaram provas'
        },
        {
          data: '2024-04-15',
          descricao: 'Despacho Saneador',
          observacao: 'Processo saneado, marcada audiência'
        },
        {
          data: '2024-06-10',
          descricao: 'Audiência de Instrução',
          observacao: 'Realizada audiência, colhidas provas orais'
        }
      ],
      jurimetria: {
        tempo_total_dias: calcularDiasEntre('2024-01-15', '2024-06-10'),
        total_movimentacoes: 7,
        tempo_medio_entre_movimentacoes: 25,
        fase_atual: 'Instrução',
        tempo_na_fase_atual: 35,
        previsao_sentenca: '2024-08-15'
      }
    };
  } else if (tipo === 'nome') {
    // Simular busca por nome retornando múltiplos processos
    return [
      {
        numero_processo: '1001234-12.2024.8.26.0001',
        classe: 'Ação de Cobrança',
        tribunal: 'TJSP',
        data_ajuizamento: '2024-01-10',
        status: 'Em andamento'
      },
      {
        numero_processo: '2005678-34.2023.8.26.0002',
        classe: 'Execução',
        tribunal: 'TJSP',
        data_ajuizamento: '2023-05-20',
        status: 'Suspenso'
      }
    ];
  } else if (tipo === 'documento') {
    // Simular busca por CPF/CNPJ
    return [
      {
        numero_processo: '3009876-56.2024.8.26.0003',
        classe: 'Indenização',
        tribunal: 'TJSP',
        data_ajuizamento: '2024-03-05',
        status: 'Sentenciado'
      }
    ];
  }

  return null;
}

function calcularDiasEntre(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
