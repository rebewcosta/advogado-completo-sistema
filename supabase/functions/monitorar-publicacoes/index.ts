
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitoringRequest {
  user_id: string;
  nomes: string[];
  estados: string[];
  palavras_chave: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, nomes, estados, palavras_chave }: MonitoringRequest = await req.json();
    
    console.log(`Iniciando monitoramento para usuário: ${user_id}`);
    const inicioExecucao = Date.now();

    // Criar log de monitoramento
    const { data: logData, error: logError } = await supabase
      .from('logs_monitoramento')
      .insert({
        user_id,
        status: 'executando',
        fontes_consultadas: []
      })
      .select()
      .single();

    if (logError) {
      console.error('Erro ao criar log:', logError);
      throw logError;
    }

    const logId = logData.id;
    let publicacoesEncontradas = 0;
    let fontesConsultadas: string[] = [];
    let erros: string[] = [];

    try {
      // Buscar fontes ativas
      const { data: fontes, error: fontesError } = await supabase
        .from('fontes_diarios')
        .select('*')
        .eq('ativo', true);

      if (fontesError) {
        throw fontesError;
      }

      console.log(`Encontradas ${fontes?.length || 0} fontes ativas`);

      // Filtrar fontes por estado se especificado
      const fontesParaMonitorar = fontes?.filter(fonte => 
        estados.length === 0 || estados.includes(fonte.estado)
      ) || [];

      console.log(`Fontes para monitorar: ${fontesParaMonitorar.length}`);

      // Processar cada fonte
      for (const fonte of fontesParaMonitorar) {
        try {
          console.log(`Processando fonte: ${fonte.nome} - ${fonte.estado}`);
          fontesConsultadas.push(fonte.nome);

          // Simular busca por publicações (implementação real dependeria do site específico)
          const publicacoes = await buscarPublicacoesFonte(fonte, nomes, palavras_chave);
          
          console.log(`Encontradas ${publicacoes.length} publicações em ${fonte.nome}`);

          // Inserir publicações encontradas
          for (const pub of publicacoes) {
            const { error: insertError } = await supabase
              .from('publicacoes_diario_oficial')
              .insert({
                user_id,
                nome_advogado: pub.nome_advogado,
                titulo_publicacao: pub.titulo,
                conteudo_publicacao: pub.conteudo,
                data_publicacao: pub.data,
                diario_oficial: fonte.nome,
                estado: fonte.estado,
                comarca: pub.comarca,
                numero_processo: pub.numero_processo,
                tipo_publicacao: pub.tipo,
                url_publicacao: pub.url,
                segredo_justica: false,
                lida: false,
                importante: false
              });

            if (!insertError) {
              publicacoesEncontradas++;
            } else {
              console.error('Erro ao inserir publicação:', insertError);
              erros.push(`Erro ao inserir publicação: ${insertError.message}`);
            }
          }

          // Atualizar última verificação da fonte
          await supabase
            .from('fontes_diarios')
            .update({ ultima_verificacao: new Date().toISOString() })
            .eq('id', fonte.id);

        } catch (error) {
          console.error(`Erro ao processar fonte ${fonte.nome}:`, error);
          erros.push(`Erro na fonte ${fonte.nome}: ${error.message}`);
        }
      }

      // Atualizar configuração com última busca
      await supabase
        .from('configuracoes_monitoramento')
        .update({ ultima_busca: new Date().toISOString() })
        .eq('user_id', user_id);

      // Finalizar log
      const tempoExecucao = Math.round((Date.now() - inicioExecucao) / 1000);
      await supabase
        .from('logs_monitoramento')
        .update({
          status: 'concluido',
          publicacoes_encontradas: publicacoesEncontradas,
          tempo_execucao_segundos: tempoExecucao,
          fontes_consultadas: fontesConsultadas,
          erros: erros.length > 0 ? erros.join('; ') : null
        })
        .eq('id', logId);

      console.log(`Monitoramento concluído: ${publicacoesEncontradas} publicações encontradas`);

      return new Response(
        JSON.stringify({
          success: true,
          publicacoes_encontradas: publicacoesEncontradas,
          fontes_consultadas: fontesConsultadas.length,
          tempo_execucao: tempoExecucao,
          erros: erros.length > 0 ? erros : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Erro durante monitoramento:', error);
      
      // Atualizar log com erro
      await supabase
        .from('logs_monitoramento')
        .update({
          status: 'erro',
          erros: error.message,
          tempo_execucao_segundos: Math.round((Date.now() - inicioExecucao) / 1000)
        })
        .eq('id', logId);

      throw error;
    }

  } catch (error) {
    console.error('Erro na função de monitoramento:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function buscarPublicacoesFonte(fonte: any, nomes: string[], palavrasChave: string[]) {
  try {
    console.log(`Fazendo scraping de: ${fonte.url_base}`);
    
    // Simular dados de exemplo para demonstração
    // Em uma implementação real, faria scraping do site real
    const publicacoesSimuladas = [];
    
    // Gerar algumas publicações simuladas baseadas nos nomes
    for (const nome of nomes) {
      if (Math.random() > 0.7) { // 30% de chance de encontrar algo
        publicacoesSimuladas.push({
          nome_advogado: nome,
          titulo: `Citação - ${nome}`,
          conteudo: `O advogado ${nome} é citado para comparecer em audiência marcada para o dia ${new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Processo nº ${Math.floor(Math.random() * 9000000) + 1000000}-${Math.floor(Math.random() * 90) + 10}.${new Date().getFullYear()}.8.26.0100`,
          data: new Date().toISOString().split('T')[0],
          comarca: 'São Paulo',
          numero_processo: `${Math.floor(Math.random() * 9000000) + 1000000}-${Math.floor(Math.random() * 90) + 10}.${new Date().getFullYear()}.8.26.0100`,
          tipo: 'Citação',
          url: `${fonte.url_base}/publicacao/${Date.now()}`
        });
      }
    }
    
    return publicacoesSimuladas;
    
  } catch (error) {
    console.error(`Erro ao fazer scraping de ${fonte.url_base}:`, error);
    return [];
  }
}
