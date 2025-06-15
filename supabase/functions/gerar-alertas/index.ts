
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let body
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const userId = body.user_id
    
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'user_id é obrigatório' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Buscar configurações do usuário
    const { data: config } = await supabaseClient
      .from('prazo_configuracoes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    const diasCritico = config?.dias_alerta_critico || 3
    const diasUrgente = config?.dias_alerta_urgente || 7
    const diasMedio = config?.dias_alerta_medio || 15

    let totalAlertas = 0
    const hoje = new Date()

    // Gerar alertas para processos
    const { data: processos } = await supabaseClient
      .from('processos')
      .select('*')
      .eq('user_id', userId)
      .not('proximo_prazo', 'is', null)

    if (processos && processos.length > 0) {
      for (const processo of processos) {
        const dataPrazo = new Date(processo.proximo_prazo)
        const diasRestantes = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        if (diasRestantes <= diasMedio && diasRestantes >= 0) {
          let tipoAlerta = 'medio'
          if (diasRestantes <= diasCritico) {
            tipoAlerta = 'critico'
          } else if (diasRestantes <= diasUrgente) {
            tipoAlerta = 'urgente'
          }

          // Verificar se já existe um alerta
          const { data: alertaExistente } = await supabaseClient
            .from('prazo_alertas')
            .select('id')
            .eq('user_id', userId)
            .eq('processo_id', processo.id)
            .eq('data_prazo', processo.proximo_prazo)
            .maybeSingle()

          if (!alertaExistente) {
            const { error: insertError } = await supabaseClient
              .from('prazo_alertas')
              .insert({
                user_id: userId,
                processo_id: processo.id,
                tipo_prazo: 'processo',
                tipo_alerta: tipoAlerta,
                data_prazo: processo.proximo_prazo,
                dias_restantes: diasRestantes,
                titulo: `Prazo do processo ${processo.numero_processo}`,
                descricao: `Processo ${processo.numero_processo} vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
                alerta_enviado: false
              })

            if (!insertError) {
              totalAlertas++
            }
          }
        }
      }
    }

    // Gerar alertas para eventos da agenda
    const { data: eventos } = await supabaseClient
      .from('agenda_eventos')
      .select('*')
      .eq('user_id', userId)
      .gte('data_hora_inicio', new Date().toISOString())

    if (eventos && eventos.length > 0) {
      for (const evento of eventos) {
        const dataEvento = new Date(evento.data_hora_inicio)
        const diasRestantes = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        if (diasRestantes <= diasMedio && diasRestantes >= 0) {
          let tipoAlerta = 'medio'
          if (diasRestantes <= diasCritico) {
            tipoAlerta = 'critico'
          } else if (diasRestantes <= diasUrgente) {
            tipoAlerta = 'urgente'
          }

          // Verificar se já existe um alerta
          const { data: alertaExistente } = await supabaseClient
            .from('prazo_alertas')
            .select('id')
            .eq('user_id', userId)
            .eq('evento_agenda_id', evento.id)
            .eq('data_prazo', evento.data_hora_inicio.split('T')[0])
            .maybeSingle()

          if (!alertaExistente) {
            const { error: insertError } = await supabaseClient
              .from('prazo_alertas')
              .insert({
                user_id: userId,
                evento_agenda_id: evento.id,
                tipo_prazo: 'evento_agenda',
                tipo_alerta: tipoAlerta,
                data_prazo: evento.data_hora_inicio.split('T')[0],
                dias_restantes: diasRestantes,
                titulo: `Evento: ${evento.titulo}`,
                descricao: `Evento "${evento.titulo}" acontece em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
                alerta_enviado: false
              })

            if (!insertError) {
              totalAlertas++
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertas_gerados: totalAlertas,
        message: `${totalAlertas} ${totalAlertas === 1 ? 'alerta gerado' : 'alertas gerados'} com sucesso!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        alertas_gerados: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
