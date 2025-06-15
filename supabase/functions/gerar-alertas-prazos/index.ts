
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
    console.log('Iniciando geração de alertas...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    console.log('Gerando alertas para usuário:', user.id)
    
    // Buscar configurações do usuário ou usar padrões
    const { data: config } = await supabaseClient
      .from('prazo_configuracoes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const diasCritico = config?.dias_alerta_critico || 3
    const diasUrgente = config?.dias_alerta_urgente || 7
    const diasMedio = config?.dias_alerta_medio || 15

    let totalAlertas = 0
    const hoje = new Date()
    const dataHoje = hoje.toISOString().split('T')[0]

    console.log('Configurações de prazo:', { diasCritico, diasUrgente, diasMedio })

    // Gerar alertas para processos com próximo prazo
    const { data: processos } = await supabaseClient
      .from('processos')
      .select('*')
      .eq('user_id', user.id)
      .not('proximo_prazo', 'is', null)

    console.log('Processos encontrados:', processos?.length || 0)

    if (processos && processos.length > 0) {
      for (const processo of processos) {
        const dataPrazo = new Date(processo.proximo_prazo)
        const diasRestantes = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`Processo ${processo.numero_processo}: ${diasRestantes} dias restantes`)

        if (diasRestantes <= diasMedio && diasRestantes >= 0) {
          let tipoAlerta = 'medio'
          if (diasRestantes <= diasCritico) {
            tipoAlerta = 'critico'
          } else if (diasRestantes <= diasUrgente) {
            tipoAlerta = 'urgente'
          }

          // Verificar se já existe um alerta para este processo
          const { data: alertaExistente } = await supabaseClient
            .from('prazo_alertas')
            .select('id')
            .eq('user_id', user.id)
            .eq('processo_id', processo.id)
            .eq('data_prazo', processo.proximo_prazo)
            .maybeSingle()

          if (!alertaExistente) {
            const { error } = await supabaseClient
              .from('prazo_alertas')
              .insert({
                user_id: user.id,
                processo_id: processo.id,
                tipo_prazo: 'processo',
                tipo_alerta: tipoAlerta,
                data_prazo: processo.proximo_prazo,
                dias_restantes: diasRestantes,
                titulo: `Prazo do processo ${processo.numero_processo}`,
                descricao: `Processo ${processo.numero_processo} vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
                alerta_enviado: false
              })

            if (!error) {
              totalAlertas++
              console.log('Alerta criado para processo:', processo.numero_processo)
            } else {
              console.error('Erro ao criar alerta para processo:', error)
            }
          }
        }
      }
    }

    // Gerar alertas para eventos da agenda
    const { data: eventos } = await supabaseClient
      .from('agenda_eventos')
      .select('*')
      .eq('user_id', user.id)
      .gte('data_hora_inicio', new Date().toISOString())

    console.log('Eventos encontrados:', eventos?.length || 0)

    if (eventos && eventos.length > 0) {
      for (const evento of eventos) {
        const dataEvento = new Date(evento.data_hora_inicio)
        const diasRestantes = Math.ceil((dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        console.log(`Evento ${evento.titulo}: ${diasRestantes} dias restantes`)

        if (diasRestantes <= diasMedio && diasRestantes >= 0) {
          let tipoAlerta = 'medio'
          if (diasRestantes <= diasCritico) {
            tipoAlerta = 'critico'
          } else if (diasRestantes <= diasUrgente) {
            tipoAlerta = 'urgente'
          }

          // Verificar se já existe um alerta para este evento
          const { data: alertaExistente } = await supabaseClient
            .from('prazo_alertas')
            .select('id')
            .eq('user_id', user.id)
            .eq('evento_agenda_id', evento.id)
            .eq('data_prazo', evento.data_hora_inicio.split('T')[0])
            .maybeSingle()

          if (!alertaExistente) {
            const { error } = await supabaseClient
              .from('prazo_alertas')
              .insert({
                user_id: user.id,
                evento_agenda_id: evento.id,
                tipo_prazo: 'evento_agenda',
                tipo_alerta: tipoAlerta,
                data_prazo: evento.data_hora_inicio.split('T')[0],
                dias_restantes: diasRestantes,
                titulo: `Evento: ${evento.titulo}`,
                descricao: `Evento "${evento.titulo}" acontece em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
                alerta_enviado: false
              })

            if (!error) {
              totalAlertas++
              console.log('Alerta criado para evento:', evento.titulo)
            } else {
              console.error('Erro ao criar alerta para evento:', error)
            }
          }
        }
      }
    }

    console.log('Total de alertas gerados:', totalAlertas)

    return new Response(
      JSON.stringify({ 
        success: true,
        alertas_gerados: totalAlertas,
        message: `${totalAlertas} ${totalAlertas === 1 ? 'alerta gerado' : 'alertas gerados'} com sucesso!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro ao gerar alertas:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        alertas_gerados: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
