import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.4.0"; // Verifique a versão mais recente se necessário

// Interface para os dados do evento da agenda que precisamos
interface EventoAgenda {
  id: string;
  user_id: string;
  titulo: string;
  data_hora_inicio: string; // ISO string
  descricao_evento: string | null;
  clientes: { nome: string } | null; // Supondo que você faz um join para pegar o nome do cliente
  processos: { numero_processo: string } | null; // Supondo join para número do processo
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
  pref_alertas_prazo?: boolean; // Usaremos esta preferência
  // Outras preferências podem ser adicionadas aqui
}

interface UserData {
  email?: string;
  user_metadata?: UserMetadata;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const emailFromAddress = Deno.env.get("EMAIL_FROM_ADDRESS") || '"JusGestão Lembretes <lembretes@sisjusgestao.com.br>"';
const siteUrl = Deno.env.get("SITE_URL") || "https://sisjusgestao.com.br";

const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

// Cabeçalhos CORS (podem não ser estritamente necessários para uma função agendada, mas é uma boa prática)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sendReminderEmail = async (userEmail: string, userName: string, eventTitle: string, eventTime: string, eventLink: string, type: 'evento' | 'prazo') => {
  const subject = type === 'evento' 
    ? `🔔 Lembrete de Compromisso: ${eventTitle}` 
    : `⏰ Lembrete de Prazo: ${eventTitle}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 25px; border-radius: 8px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://lqprcsquknlegzmzdoct.supabase.co/storage/v1/object/public/logos/public/logo_completa_jusgestao.png" alt="JusGestão Logo" style="max-width: 170px; height: auto;"/>
      </div>
      <h2 style="color: #1a56db; text-align: center; font-size: 22px; margin-bottom: 20px;">Lembrete JusGestão</h2>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <p>Olá ${userName || 'Usuário'},</p>
        <p>Este é um lembrete para o seu ${type === 'evento' ? 'compromisso' : 'prazo'}:</p>
        <p><strong>${eventTitle}</strong></p>
        <p><strong>Data e Hora:</strong> ${eventTime}</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${eventLink}" style="background-color: #1a56db; color: white; padding: 12px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
            Ver Detalhes
          </a>
        </p>
        <p style="font-size: 0.85em; color: #555;">Se você já cuidou deste item, pode ignorar este lembrete.</p>
      </div>
      <br>
      <p style="text-align: center; font-size: 0.9em; color: #444;">Atenciosamente,<br>Equipe JusGestão</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 25px 0;"/>
      <p style="font-size: 0.8em; color: #888; text-align: center;">
        Este é um email automático. Para suporte, contate <a href="mailto:suporte@sisjusgestao.com.br" style="color: #1a56db;">suporte@sisjusgestao.com.br</a>.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: emailFromAddress,
      to: [userEmail],
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error(`Erro ao enviar email para ${userEmail} via Resend:`, error);
      return { success: false, error };
    }
    console.log(`Email de lembrete enviado para ${userEmail} com sucesso:`, data?.id);
    return { success: true, data };
  } catch (e) {
    console.error(`Exceção ao enviar email para ${userEmail}:`, e);
    return { success: false, error: e };
  }
};

serve(async (req: Request) => {
  // Para funções agendadas, o método pode não ser POST.
  // Adicionar verificação de segredo se quiser proteger a execução manual.
  // const authHeader = req.headers.get('Authorization');
  // if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_FUNCTION_INVOKE_SECRET')}`) {
  //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  // }

  console.log("Função 'lembretes-eventos-agenda' INVOCADA.");

  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // --- Lembretes para Eventos da Agenda ---
    const { data: eventosProximos, error: eventosError } = await supabaseAdmin
      .from("agenda_eventos")
      .select("id, user_id, titulo, data_hora_inicio, descricao_evento, clientes (nome), processos (numero_processo)")
      .gte("data_hora_inicio", now.toISOString()) // Eventos que ainda não passaram
      .lte("data_hora_inicio", oneHourFromNow.toISOString()) // Eventos na próxima hora
      // TODO: Adicionar uma coluna `lembrete_proxima_hora_enviado BOOLEAN` e filtrar por `false`
      // E depois atualizar para `true` após o envio.
      .eq("status_evento", "Agendado"); // Apenas eventos agendados

    if (eventosError) throw eventosError;

    for (const evento of eventosProximos as EventoAgenda[]) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(evento.user_id);
      if (userError || !userData.user || !userData.user.email) continue;
      
      const userPrefs = userData.user.user_metadata as UserMetadata;
      if (userPrefs?.pref_alertas_prazo === true) { // Reutilizando pref_alertas_prazo
        await sendReminderEmail(
          userData.user.email,
          userPrefs.nome || userData.user.email.split('@')[0],
          evento.titulo,
          new Date(evento.data_hora_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          `${siteUrl}/agenda?view=${evento.id}`, // Link para o evento
          'evento'
        );
        // TODO: Marcar evento como lembrete enviado (para não enviar de novo)
        // await supabaseAdmin.from('agenda_eventos').update({ lembrete_proxima_hora_enviado: true }).eq('id', evento.id);
      }
    }

    // --- Lembretes para Prazos de Processos (para amanhã) ---
    const { data: processosComPrazoAmanha, error: processosError } = await supabaseAdmin
      .from("processos")
      .select("id, user_id, numero_processo, proximo_prazo, clientes (nome)")
      .eq("proximo_prazo", tomorrowStart.toISOString().split('T')[0]) // Comparar apenas a data YYYY-MM-DD
      .eq("status_processo", "Em andamento")
      // TODO: Adicionar coluna `lembrete_prazo_enviado BOOLEAN` e filtrar
      // E depois atualizar.

    if (processosError) throw processosError;

    for (const processo of processosComPrazoAmanha as ProcessoPrazo[]) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(processo.user_id);
      if (userError || !userData.user || !userData.user.email) continue;

      const userPrefs = userData.user.user_metadata as UserMetadata;
      if (userPrefs?.pref_alertas_prazo === true) {
        await sendReminderEmail(
          userData.user.email,
          userPrefs.nome || userData.user.email.split('@')[0],
          `Prazo Processo: ${processo.numero_processo}`,
          new Date(processo.proximo_prazo + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }), // Adicionar T00:00:00Z
          `${siteUrl}/meus-processos?view=${processo.id}`, // Link para o processo
          'prazo'
        );
        // TODO: Marcar processo como lembrete enviado
        // await supabaseAdmin.from('processos').update({ lembrete_prazo_enviado: true }).eq('id', processo.id);
      }
    }

    console.log("Função 'lembretes-eventos-agenda' CONCLUÍDA.");
    return new Response(JSON.stringify({ message: "Lembretes processados." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na função 'lembretes-eventos-agenda':", error.message);
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});