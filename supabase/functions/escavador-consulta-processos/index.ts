import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[ESCAVADOR] Iniciando consulta de processos');

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[ESCAVADOR] Token de autorização não fornecido');
      return new Response(JSON.stringify({ error: 'Token de autorização necessário' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[ESCAVADOR] Usuário não autenticado:', authError);
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ESCAVADOR] Usuário autenticado: ${user.id}`);

    // Obter OAB do body da requisição
    const { oab } = await req.json();
    
    if (!oab) {
      console.error('[ESCAVADOR] OAB não fornecida na requisição');
      return new Response(JSON.stringify({ 
        error: 'OAB é obrigatória para a consulta' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[ESCAVADOR] OAB fornecida: ${oab}`);

    // Obter token do Escavador
    const escavadorToken = Deno.env.get('ESCAVADOR_TOKEN');
    if (!escavadorToken) {
      console.error('[ESCAVADOR] Token do Escavador não configurado');
      return new Response(JSON.stringify({ error: 'Token do Escavador não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Consultar API do Escavador
    console.log(`[ESCAVADOR] Consultando processos para OAB: ${oab}`);
    
    const escavadorUrl = `https://api.escavador.com/api/v2/search/lawsuits-by-oab`;
    const escavadorResponse = await fetch(escavadorUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${escavadorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oab: oab,
        page: 1,
        limit: 50
      }),
    });

    if (!escavadorResponse.ok) {
      const errorText = await escavadorResponse.text();
      console.error('[ESCAVADOR] Erro na API do Escavador:', escavadorResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Erro na consulta Escavador: ${escavadorResponse.status} - ${errorText}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const escavadorData = await escavadorResponse.json();
    console.log(`[ESCAVADOR] Processos encontrados: ${escavadorData.results?.length || 0}`);

    // Processar dados do Escavador
    const processosEscavador = escavadorData.results || [];
    const processosNormalizados = processosEscavador.map((processo: any) => ({
      numero_processo: processo.lawsuit_number || processo.number || '',
      tipo_processo: processo.lawsuit_class || processo.subject || 'Processo Judicial',
      status_processo: processo.status || 'Importado da OAB',
      vara_tribunal: processo.court || processo.tribunal || '',
      proximo_prazo: null, // API do Escavador não fornece prazos específicos
      cliente_id: null, // Será associado manualmente pelo usuário se necessário
      nome_cliente_text: null,
      fonte: 'Escavador'
    }));

    // Verificar processos existentes
    const numerosProcessos = processosNormalizados.map(p => p.numero_processo).filter(Boolean);
    const { data: processosExistentes } = await supabase
      .from('processos')
      .select('numero_processo')
      .eq('user_id', user.id)
      .in('numero_processo', numerosProcessos);

    const numerosExistentes = new Set(processosExistentes?.map(p => p.numero_processo) || []);
    const processosNovos = processosNormalizados.filter(p => 
      p.numero_processo && !numerosExistentes.has(p.numero_processo)
    );

    console.log(`[ESCAVADOR] Processos novos para importar: ${processosNovos.length}`);
    console.log(`[ESCAVADOR] Processos já existentes: ${numerosExistentes.size}`);

    // Retornar resultado da consulta
    return new Response(JSON.stringify({
      success: true,
      oab: oab,
      totalEncontrados: processosEscavador.length,
      processosNovos: processosNovos.length,
      processosExistentes: numerosExistentes.size,
      processos: processosNovos
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ESCAVADOR] Erro geral:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno no servidor', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});