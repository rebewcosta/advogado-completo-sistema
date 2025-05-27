import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.4.0";

// Interfaces (permanecem as mesmas)
interface EventoAgenda {
  id: string;
  user_id: string;
  titulo: string;
  data_hora_inicio: string; // ISO string
  descricao_evento: string | null;
  clientes: { nome: string } | null;
  processos: { numero_processo: string } | null;
}

interface ProcessoPrazo {
  id: string;
  user_id: string;
  numero_processo: string;
  proximo_prazo: string; // Formato YYYY-MM-DD
  clientes: { nome: string } | null;
}

interface UserMetadata {
  nome?: string;
  pref_alertas_prazo?: boolean;
}

// Constantes de ambiente (permanecem as mesmas)
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const emailFromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") || '"JusGestão Lembretes <lembretes@sisjusgestao.com.br>"';
const siteUrl = Deno.env.get("SITE_URL") || "https://sisjusgestao.com.br";

const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const resendInstance = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função sendReminderEmail (permanece a mesma)
const sendReminderEmail = async (userEmail: string, userName: string, eventTitle: string, eventTime: string, eventLink: string, type: 'evento' | 'prazo') => {
  const typeName = type === 'evento' ? 'compromisso' : 'prazo';
  const subject = type === 'evento' 
    ? `🔔 Lembrete de Compromisso: ${eventTitle}` 
    : `⏰ Lembrete de Prazo: ${eventTitle}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; padding: 25px; border-radius: 8px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://lqprcsquknlegzmzdoct.supabase.co/storage/v1/object/public/logos/public/logo_completa_jusgestao.png" alt="JusGestão Logo" style="max-width: 170px; height: auto;"/>
      </div>
      <h2 style="color: #1a56db; text-align: center; font-size: 22px; margin-bottom: 10px; padding-bottom:10px; border-bottom: 1px solid #eee;">Lembrete JusGestão</h2>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px;">
        <p>Olá ${userName || 'Usuário'},</p>
        <p>Este é um lembrete para o seu ${typeName}:</p>
        <p style="font-size: 1.1em; font-weight: bold; color: #2c3e50; margin-top: 5px; margin-bottom: 5px;">${eventTitle}</p>
        <p><strong>Data e Hora:</strong> ${eventTime}</p>
        <p style="text-align: center; margin: 25px 0;">
          <a href="${eventLink}" style="background-color: #1a56db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 15px;">
            Ver Detalhes no Sistema
          </a>
        </p>
        <p style="font-size: 0.9em; color: #555;">Se você já cuidou deste item, pode ignorar este lembrete.</p>
      </div>
      <p style="text-align: center; font-size: 0.95em; color: #444; margin-top: 25px;">Atenciosamente,<br/>Equipe JusGestão</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;"/>
      <p style="font-size: 0.8em; color: #888; text-align: center;">
        Este é um email automático. Para suporte, contate <a href="mailto:suporte@sisjusgestao.com.br" style="color: #1a56db;">suporte@sisjusgestao.com.br</a>.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resendInstance.emails.send({
      from: emailFromAddress,
      to: [userEmail],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error(`Erro ao enviar email para ${userEmail} via Resend:`, error);
      return { success: false, errorDetail: error }; // Modificado para errorDetail
    }
    console.log(`Email de lembrete enviado para ${userEmail} com sucesso: ID ${data?.id}`);
    return { success: true, data };
  } catch (e) {
    console.error(`Exceção ao enviar email para ${userEmail}:`, e);
    return { success: false, errorDetail: e }; // Modificado para errorDetail
  }
};


serve(async (req: Request) => {
  console.log("Função 'lembretes-eventos-agenda' INVOCADA.");
  let reminderSentCount = 0;
  const now = new Date();
  const nowISO = now.toISOString();

  try {
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    // --- Lembretes para Eventos da Agenda (próxima hora) ---
    console.log(`Buscando eventos da agenda entre ${nowISO} e ${oneHourFromNow.toISOString()}`);
    const { data: eventosProximos, error: eventosError } = await supabaseAdmin
      .from("agenda_eventos")
      .select("id, user_id, titulo, data_hora_inicio, descricao_evento, clientes (nome), processos (numero_processo)")
      .gte("data_hora_inicio", nowISO)
      .lte("data_hora_inicio", oneHourFromNow.toISOString())
      .eq("status_evento", "Agendado")
      .is("lembrete_proxima_hora_enviado_em", null); // MODIFICAÇÃO: Buscar apenas os não notificados

    if (eventosError) {
      console.error("Erro ao buscar eventos próximos:", eventosError);
      // Não lançar erro aqui, continuar para os prazos
    } else {
      console.log(`${eventosProximos?.length || 0} eventos da agenda encontrados para lembrete na próxima hora.`);
      if (eventosProximos) {
        for (const evento of eventosProximos as any[]) {
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(evento.user_id);
          if (userError || !userData.user || !userData.user.email) {
            console.warn(`Usuário não encontrado ou sem email para evento ID ${evento.id}. Erro: ${userError?.message}`);
            continue;
          }
          
          const userPrefs = userData.user.user_metadata as UserMetadata;
          if (userPrefs?.pref_alertas_prazo === true) {
            console.log(`Enviando lembrete de evento para ${userData.user.email} - Evento: ${evento.titulo}`);
            const emailResult = await sendReminderEmail(
              userData.user.email,
              userPrefs.nome || userData.user.email.split('@')[0],
              evento.titulo,
              new Date(evento.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
              `${siteUrl}/agenda?view=${evento.id}`,
              'evento'
            );
            if (emailResult.success) {
              // MODIFICAÇÃO: Marcar como enviado
              const { error: updateError } = await supabaseAdmin
                .from('agenda_eventos')
                .update({ lembrete_proxima_hora_enviado_em: nowISO })
                .eq('id', evento.id);
              if (updateError) {
                console.error(`Falha ao marcar lembrete de evento ${evento.id} como enviado:`, updateError);
              } else {
                console.log(`Lembrete de evento ${evento.id} marcado como enviado.`);
                reminderSentCount++;
              }
            }
          } else {
            console.log(`Lembrete de evento para ${userData.user.email} não enviado (preferência desativada).`);
          }
        }
      }
    }

    // --- Lembretes para Prazos de Processos (para amanhã) ---
    console.log(`Buscando prazos de processos para amanhã: ${tomorrowDateString}`);
    const { data: processosComPrazoAmanha, error: processosError } = await supabaseAdmin
      .from("processos")
      .select("id, user_id, numero_processo, proximo_prazo, clientes (nome)")
      .eq("proximo_prazo", tomorrowDateString)
      .eq("status_processo", "Em andamento")
      .is("lembrete_prazo_amanha_enviado_em", null); // MODIFICAÇÃO: Buscar apenas os não notificados

    if (processosError) {
      console.error("Erro ao buscar prazos de processos:", processosError);
      // Não lançar erro aqui, apenas logar
    } else {
      console.log(`${processosComPrazoAmanha?.length || 0} prazos de processos encontrados para amanhã.`);
      if (processosComPrazoAmanha) {
        for (const processo of processosComPrazoAmanha as any[]) { 
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(processo.user_id);
          if (userError || !userData.user || !userData.user.email) {
            console.warn(`Usuário não encontrado ou sem email para processo ID ${processo.id}. Erro: ${userError?.message}`);
            continue;
          }

          const userPrefs = userData.user.user_metadata as UserMetadata;
          if (userPrefs?.pref_alertas_prazo === true) {
            console.log(`Enviando lembrete de prazo para ${userData.user.email} - Processo: ${processo.numero_processo}`);
            const emailResult = await sendReminderEmail(
              userData.user.email,
              userPrefs.nome || userData.user.email.split('@')[0],
              `Prazo Processo: ${processo.numero_processo}`,
              new Date(processo.proximo_prazo + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
              `${siteUrl}/meus-processos?view=${processo.id}`,
              'prazo'
            );
            if (emailResult.success) {
              // MODIFICAÇÃO: Marcar como enviado
              const { error: updateError } = await supabaseAdmin
                .from('processos')
                .update({ lembrete_prazo_amanha_enviado_em: nowISO })
                .eq('id', processo.id);
              if (updateError) {
                console.error(`Falha ao marcar lembrete de prazo ${processo.id} como enviado:`, updateError);
              } else {
                console.log(`Lembrete de prazo ${processo.id} marcado como enviado.`);
                reminderSentCount++;
              }
            }
          } else {
            console.log(`Lembrete de prazo para ${userData.user.email} não enviado (preferência desativada).`);
          }
        }
      }
    }
    
    console.log(`Função 'lembretes-eventos-agenda' CONCLUÍDA. ${reminderSentCount} lembretes efetivamente enviados.`);
    return new Response(JSON.stringify({ message: `Lembretes processados. ${reminderSentCount} notificações enviadas.` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro CRÍTICO na função 'lembretes-eventos-agenda':", error.message, error);
    return new Response(JSON.stringify({ error: `Erro interno do servidor: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});