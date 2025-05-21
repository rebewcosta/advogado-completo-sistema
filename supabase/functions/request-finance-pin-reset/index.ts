// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; // Mantenha a versão que seu projeto usa
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Mantenha a versão que seu projeto usa
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0'; // Mantenha a versão que seu projeto usa
import { send } from "https://deno.land/x/deno_smtp@v0.8.0/mod.ts"; // Biblioteca SMTP para Deno (verifique a versão mais recente se desejar)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log("request-finance-pin-reset: Função INVOCADA.");

  if (req.method === 'OPTIONS') {
    console.log("request-finance-pin-reset: Requisição OPTIONS. Respondendo com status 200 e headers CORS.");
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sisjusgestao.com.br';

    // Segredos para o SMTP
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPortStr = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const smtpSenderName = Deno.env.get('SMTP_SENDER_NAME') || 'Sistema JusGestão';
    const emailFromAddress = Deno.env.get('EMAIL_FROM_ADDRESS');

    // Validação dos segredos
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("request-finance-pin-reset: ERRO - Variáveis de ambiente Supabase não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor Supabase ausente." }), { status: 500, headers: responseHeaders });
    }
    if (!smtpHost || !smtpPortStr || !smtpUser || !smtpPassword || !emailFromAddress) {
      console.error("request-finance-pin-reset: ERRO - Variáveis de ambiente SMTP não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica de envio de email ausente." }), { status: 500, headers: responseHeaders });
    }
    const smtpPort = parseInt(smtpPortStr, 10);
    if (isNaN(smtpPort)) {
      console.error("request-finance-pin-reset: ERRO - Porta SMTP inválida.");
      return new Response(JSON.stringify({ error: "Configuração de porta SMTP inválida." }), { status: 500, headers: responseHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("request-finance-pin-reset: Token de autenticação ausente ou malformado.");
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), { status: 401, headers: responseHeaders });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("request-finance-pin-reset: Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), { status: 401, headers: responseHeaders });
    }

    if (!user.email) {
        console.error("request-finance-pin-reset: Usuário não possui email cadastrado.");
        return new Response(JSON.stringify({ error: 'Usuário não possui email para envio do link.' }), { status: 400, headers: responseHeaders });
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Token expira em 1 hora

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          finance_pin_reset_token: resetToken,
          finance_pin_reset_expires_at: expiresAt,
        }
      }
    );

    if (updateError) {
      console.error("request-finance-pin-reset: Erro ao salvar token de reset no usuário:", updateError.message);
      throw updateError;
    }

    const resetPinLink = `${siteUrl}/redefinir-pin-financeiro?token=${resetToken}`;
    const userName = user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário";
    const expirationTimeLocale = new Date(expiresAt).toLocaleString("pt-BR", { dateStyle: 'full', timeStyle: 'short'});

    const emailSubject = 'Redefina seu PIN Financeiro - JusGestão';
    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1a56db;">Redefinição de PIN Financeiro - JusGestão</h2>
        <p>Olá ${userName},</p>
        <p>Recebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.</p>
        <p>Clique no link abaixo para criar um novo PIN:</p>
        <p style="margin: 20px 0;">
          <a href="${resetPinLink}" style="background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Redefinir meu PIN Financeiro
          </a>
        </p>
        <p>Ou copie e cole o seguinte URL no seu navegador:</p>
        <p><a href="${resetPinLink}" style="color: #1a56db;">${resetPinLink}</a></p>
        <p>Este link é válido até ${expirationTimeLocale}.</p>
        <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail ou entre em contato conosco respondendo a esta mensagem ou através de <a href="mailto:suporte@sisjusgestao.com.br" style="color: #1a56db;">suporte@sisjusgestao.com.br</a>.</p>
        <br>
        <p>Atenciosamente,<br>Equipe JusGestão<br>
          <a href="https://sisjusgestao.com.br" style="color: #1a56db;">sisjusgestao.com.br</a>
        </p>
      </div>
    `;
    const emailTextBody = `Olá ${userName},\n\nRecebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.\n\nClique no link abaixo para criar um novo PIN: ${resetPinLink}\n\nEste link é válido até ${expirationTimeLocale}.\n\nSe você não solicitou esta redefinição, por favor, ignore este e-mail.\n\nAtenciosamente,\nEquipe JusGestão`;

    let emailSentSuccessfully = false;
    let emailErrorFromService: string | null = null;

    try {
      console.log(`request-finance-pin-reset: Tentando enviar email para ${user.email} via SMTP ${smtpHost}:${smtpPort}`);
      await send({
        from: `"${smtpSenderName}" <${emailFromAddress}>`,
        to: user.email,
        subject: emailSubject,
        content: emailTextBody, // Plain text content
        html: emailHtmlBody,   // HTML content
      }, {
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPassword,
        // A biblioteca deno_smtp geralmente lida com SSL/TLS automaticamente para a porta 465
      });
      console.log("request-finance-pin-reset: Email enviado com sucesso via deno_smtp.");
      emailSentSuccessfully = true;
    } catch (err) {
      console.error("request-finance-pin-reset: Erro ao tentar enviar email via deno_smtp:", err);
      emailErrorFromService = err.message || "Erro desconhecido ao enviar email SMTP.";
    }

    if (!emailSentSuccessfully) {
      console.error("request-finance-pin-reset: Falha no envio do email:", emailErrorFromService);
      return new Response(JSON.stringify({
        message: 'Ocorreu um erro ao enviar o email de redefinição. Por favor, tente novamente mais tarde ou contate o suporte.',
        error: emailErrorFromService,
        DEBUG_ONLY_link: resetPinLink // Para depuração
      }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    console.log(`request-finance-pin-reset: Email de redefinição de PIN enviado para ${user.email}.`);
    return new Response(JSON.stringify({
      message: 'Um email com instruções para redefinir seu PIN financeiro foi enviado para o endereço associado à sua conta.',
    }), {
      status: 200, headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('request-finance-pin-reset: ERRO GERAL INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao solicitar reset de PIN.' }), {
      status: 500, headers: responseHeaders,
    });
  }
});