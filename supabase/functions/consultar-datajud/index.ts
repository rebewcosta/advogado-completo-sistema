
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

    let resultadosCount = 0;
    if (dadosSimulados) {
      resultadosCount = Array.isArray(dadosSimulados) ? dadosSimulados.length : 1;
    }

    // Salvar no cache se for consulta por número
    if (tipo === 'numero' && dadosSimulados && !Array.isArray(dadosSimulados)) {
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
            resultados_encontrados: resultadosCount
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
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

  if (tipo === 'numero') {
    // Gerar dados baseados no número do processo para maior realismo
    const numeroHash = hashCode(termo);
    const seed = Math.abs(numeroHash) % 1000;
    
    // Definir tribunais baseados no código do processo
    const tribunais = ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR', 'TJSC', 'TJGO', 'TJDF', 'TJPE', 'TJBA'];
    const tribunalIndex = seed % tribunais.length;
    const tribunalEscolhido = tribunal || tribunais[tribunalIndex];
    
    // Classes processuais realistas
    const classes = [
      'Procedimento Comum Cível',
      'Ação de Cobrança',
      'Ação de Indenização',
      'Execução de Título Extrajudicial',
      'Ação Trabalhista',
      'Mandado de Segurança',
      'Ação de Despejo',
      'Revisional de Contrato',
      'Ação de Divórcio',
      'Inventário'
    ];
    
    const assuntos = [
      'Responsabilidade Civil',
      'Contratos Bancários',
      'Direito do Consumidor',
      'Direito Trabalhista',
      'Direito Previdenciário',
      'Direito Tributário',
      'Direito Imobiliário',
      'Direito de Família',
      'Direito Empresarial',
      'Direito Administrativo'
    ];
    
    const status = ['Em andamento', 'Suspenso', 'Arquivado', 'Sentenciado', 'Baixado'];
    
    // Gerar nomes realistas
    const nomes = [
      'Maria Silva Santos', 'João Carlos Oliveira', 'Ana Paula Costa', 'Carlos Eduardo Lima',
      'Fernanda Alves Pereira', 'Roberto Santos Cruz', 'Patricia Moreira Silva', 'Ricardo Ferreira',
      'Juliana Rodrigues', 'Antonio Carlos Sousa', 'Luciana Barbosa', 'Marcos Vinicius Teixeira',
      'Camila Martins', 'Felipe Santos Rocha', 'Adriana Nascimento', 'Bruno Silva Machado'
    ];
    
    const advogados = [
      'Dr. Paulo Henrique Advocacia', 'Dra. Marina Santos Jurídica', 'Dr. Carlos Alberto Silva',
      'Dra. Fernanda Costa Advogados', 'Dr. Roberto Almeida', 'Dra. Lucia Helena Direito',
      'Dr. Eduardo Martins', 'Dra. Cristina Rocha', 'Dr. Alexandre Santos', 'Dra. Beatriz Lima'
    ];
    
    const comarcas = [
      'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba',
      'Florianópolis', 'Goiânia', 'Brasília', 'Recife', 'Salvador', 'Fortaleza', 'Manaus'
    ];
    
    const classeEscolhida = classes[seed % classes.length];
    const assuntoEscolhido = assuntos[seed % assuntos.length];
    const statusEscolhido = status[seed % status.length];
    const comarcaEscolhida = comarcas[seed % comarcas.length];
    
    // Gerar datas baseadas no seed
    const dataAjuizamento = new Date(2020 + (seed % 5), seed % 12, (seed % 28) + 1);
    const diasTramitando = Math.floor(seed / 3) + 30;
    const dataUltimaMovimentacao = new Date(dataAjuizamento.getTime() + diasTramitando * 24 * 60 * 60 * 1000);
    
    // Gerar valor da causa
    const valorCausa = (seed * 1000) + Math.floor(Math.random() * 50000) + 5000;
    
    // Gerar partes
    const autor = nomes[seed % nomes.length];
    const reu = nomes[(seed + 1) % nomes.length];
    
    // Gerar CPFs fictícios
    const cpfAutor = gerarCPFFicticio(seed);
    const cpfReu = gerarCPFFicticio(seed + 1);
    
    // Gerar movimentações realistas
    const movimentacoes = gerarMovimentacoesRealistas(dataAjuizamento, dataUltimaMovimentacao, seed);
    
    return {
      numero_processo: termo,
      classe: classeEscolhida,
      assunto: assuntoEscolhido,
      tribunal: tribunalEscolhido,
      orgao_julgador: `${Math.floor(seed % 20) + 1}ª Vara Cível`,
      comarca: comarcaEscolhida,
      data_ajuizamento: dataAjuizamento.toISOString().split('T')[0],
      data_ultima_movimentacao: dataUltimaMovimentacao.toISOString().split('T')[0],
      status: statusEscolhido,
      valor_causa: valorCausa,
      partes: [
        { nome: autor, tipo: 'Autor', documento: cpfAutor },
        { nome: reu, tipo: 'Réu', documento: cpfReu }
      ],
      advogados: [
        { nome: advogados[seed % advogados.length], oab: `${tribunalEscolhido.replace('TJ', '')} ${String(seed).padStart(6, '0')}`, parte: 'Autor' },
        { nome: advogados[(seed + 1) % advogados.length], oab: `${tribunalEscolhido.replace('TJ', '')} ${String(seed + 1000).padStart(6, '0')}`, parte: 'Réu' }
      ],
      movimentacoes: movimentacoes,
      jurimetria: {
        tempo_total_dias: diasTramitando,
        total_movimentacoes: movimentacoes.length,
        tempo_medio_entre_movimentacoes: Math.floor(diasTramitando / movimentacoes.length),
        fase_atual: determinarFaseAtual(movimentacoes),
        tempo_na_fase_atual: Math.floor(Math.random() * 60) + 15,
        previsao_sentenca: new Date(dataUltimaMovimentacao.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
  } else if (tipo === 'nome') {
    const numeroResultados = Math.floor(Math.random() * 5) + 1;
    const resultados = [];
    
    for (let i = 0; i < numeroResultados; i++) {
      const numeroProcesso = gerarNumeroProcesso();
      const classes = ['Ação de Cobrança', 'Execução', 'Indenização', 'Procedimento Comum'];
      const tribunais = ['TJSP', 'TJRJ', 'TJMG', 'TJRS'];
      const status = ['Em andamento', 'Suspenso', 'Sentenciado'];
      
      resultados.push({
        numero_processo: numeroProcesso,
        classe: classes[Math.floor(Math.random() * classes.length)],
        tribunal: tribunais[Math.floor(Math.random() * tribunais.length)],
        data_ajuizamento: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        status: status[Math.floor(Math.random() * status.length)]
      });
    }
    
    return resultados;
  } else if (tipo === 'documento') {
    const numeroResultados = Math.floor(Math.random() * 3) + 1;
    const resultados = [];
    
    for (let i = 0; i < numeroResultados; i++) {
      const numeroProcesso = gerarNumeroProcesso();
      const classes = ['Indenização', 'Cobrança', 'Execução'];
      
      resultados.push({
        numero_processo: numeroProcesso,
        classe: classes[Math.floor(Math.random() * classes.length)],
        tribunal: 'TJSP',
        data_ajuizamento: new Date(2021 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        status: Math.random() > 0.5 ? 'Em andamento' : 'Sentenciado'
      });
    }
    
    return resultados;
  }

  return null;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function gerarCPFFicticio(seed: number): string {
  const base = String(seed).padStart(9, '0').slice(-9);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${String(seed % 100).padStart(2, '0')}`;
}

function gerarNumeroProcesso(): string {
  const sequencial = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
  const dv = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const ano = new Date().getFullYear();
  const segmento = '8';
  const tribunal = '26';
  const origem = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${sequencial}-${dv}.${ano}.${segmento}.${tribunal}.${origem}`;
}

function gerarMovimentacoesRealistas(dataInicio: Date, dataFim: Date, seed: number): any[] {
  const movimentacoesTipos = [
    { descricao: 'Distribuição', observacao: 'Processo distribuído automaticamente' },
    { descricao: 'Citação', observacao: 'Citação da parte requerida' },
    { descricao: 'Contestação', observacao: 'Apresentada contestação pela parte requerida' },
    { descricao: 'Despacho', observacao: 'Determina especificação de provas' },
    { descricao: 'Manifestação', observacao: 'Partes especificaram provas' },
    { descricao: 'Despacho Saneador', observacao: 'Processo saneado, marcada audiência' },
    { descricao: 'Audiência de Instrução', observacao: 'Realizada audiência, colhidas provas orais' },
    { descricao: 'Alegações Finais', observacao: 'Apresentadas alegações finais pelas partes' },
    { descricao: 'Conclusão', observacao: 'Processo concluso para sentença' }
  ];
  
  const numeroMovimentacoes = Math.min(movimentacoesTipos.length, Math.floor(seed % 7) + 3);
  const movimentacoes = [];
  
  let dataAtual = new Date(dataInicio);
  const intervaloDias = Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)) / numeroMovimentacoes;
  
  for (let i = 0; i < numeroMovimentacoes; i++) {
    movimentacoes.push({
      data: dataAtual.toISOString().split('T')[0],
      descricao: movimentacoesTipos[i].descricao,
      observacao: movimentacoesTipos[i].observacao
    });
    
    dataAtual = new Date(dataAtual.getTime() + intervaloDias * 24 * 60 * 60 * 1000);
  }
  
  return movimentacoes;
}

function determinarFaseAtual(movimentacoes: any[]): string {
  const ultimaMovimentacao = movimentacoes[movimentacoes.length - 1];
  
  if (ultimaMovimentacao.descricao.includes('Audiência')) {
    return 'Instrução';
  } else if (ultimaMovimentacao.descricao.includes('Contestação')) {
    return 'Conhecimento';
  } else if (ultimaMovimentacao.descricao.includes('Conclusão')) {
    return 'Concluso para Sentença';
  } else if (ultimaMovimentacao.descricao.includes('Alegações')) {
    return 'Alegações Finais';
  } else {
    return 'Conhecimento';
  }
}

function calcularDiasEntre(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
