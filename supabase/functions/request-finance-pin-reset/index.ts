// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; // Ou a versão std que seu projeto usa
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Em produção, restrinja ao seu domínio: https://sisjusgestao.com.br
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log("request-finance-pin-reset: Função INVOCADA (configurada para Resend API).");

  if (req.method === 'OPTIONS') {
    console.log("request-finance-pin-reset: Requisição OPTIONS. Respondendo com status 200 e headers CORS.");
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sisjusgestao.com.br';

    // Segredos para Resend - estes serão lidos das variáveis de ambiente da função no Supabase
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // Usando o endereço que você escolheu:
    const EMAIL_FROM_ADDRESS = Deno.env.get('EMAIL_FROM_ADDRESS') || '"JusGestão Notificações <noreply@sisjusgestao.com.br>"';
    const EMAIL_REPLY_TO_ADDRESS = Deno.env.get('EMAIL_REPLY_TO_ADDRESS') || 'suporte@sisjusgestao.com.br';

    // Validação dos segredos essenciais
    const criticalEnvVars = {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
        RESEND_API_KEY: RESEND_API_KEY,
        EMAIL_FROM_ADDRESS: EMAIL_FROM_ADDRESS, // O email de onde será enviado
        SITE_URL: siteUrl
    };

    const missingVars = Object.entries(criticalEnvVars)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.error(`request-finance-pin-reset: ERRO - Variáveis de ambiente críticas ausentes: ${missingVars.join(', ')}.`);
        return new Response(JSON.stringify({ error: `Configuração crítica do servidor ausente: ${missingVars.join(', ')}.` }), { status: 500, headers: responseHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!, {
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

    const resetTokenValue = uuidv4(); // Renomeada para evitar conflito com 'token' da autenticação
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // Token expira em 1 hora

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, finance_pin_reset_token: resetTokenValue, finance_pin_reset_expires_at: expiresAt } }
    );

    if (updateError) {
      console.error("request-finance-pin-reset: Erro ao salvar token de reset no usuário:", updateError.message);
      throw updateError;
    }

    const resetPinLink = `${siteUrl}/redefinir-pin-financeiro?token=${resetTokenValue}`;
    const userName = user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário";
    const expirationTimeLocale = new Date(expiresAt).toLocaleString("pt-BR", { dateStyle: 'full', timeStyle: 'short'});

    const emailSubject = 'Redefina seu PIN Financeiro - JusGestão';
    const emailHtmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 25px; border-radius: 8px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://lqprcsquknlegzmzdoct.supabase.co/storage/v1/object/public/logos/public/logo_completa_jusgestao.png" alt="JusGestão Logo" style="max-width: 170px; height: auto;"/>
        </div>
        <h2 style="color: #1a56db; text-align: center; font-size: 22px; margin-bottom: 20px;">Redefinição de PIN Financeiro</h2>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <p>Olá ${userName},</p>
            <p>Recebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.</p>
            <p>Para criar um novo PIN, por favor, clique no botão abaixo:</p>
            <p style="text-align: center; margin: 30px 0;">
            <a href="${resetPinLink}" style="background-color: #1a56db; color: white; padding: 12px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                Redefinir meu PIN
            </a>
            </p>
            <p style="font-size: 0.9em;">Se o botão não funcionar, você pode copiar e colar o seguinte endereço no seu navegador:</p>
            <p><a href="${resetPinLink}" style="color: #1a56db; word-break: break-all; font-size: 0.9em;">${resetPinLink}</a></p>
            <p style="font-size: 0.85em; color: #555; margin-top: 15px;">Este link de redefinição é válido até ${expirationTimeLocale}. Após este período, será necessário solicitar uma nova redefinição.</p>
            <p style="font-size: 0.85em; color: #555;">Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Nenhuma alteração será feita na sua conta.</p>
            <p style="font-size: 0.85em; color: #555;">Em caso de dúvidas, entre em contato com nosso suporte: <a href="mailto:${EMAIL_REPLY_TO_ADDRESS}" style="color: #1a56db;">${EMAIL_REPLY_TO_ADDRESS}</a>.</p>
        </div>
        <br>
        <p style="text-align: center; font-size: 0.9em; color: #444;">Atenciosamente,<br>Equipe JusGestão</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 25px 0;"/>
        <p style="font-size: 0.8em; color: #888; text-align: center;">
        <a href="${siteUrl}" style="color: #1a56db;">${siteUrl}</a><br/>
        Este é um email automático. Para suporte, contate <a href="mailto:${EMAIL_REPLY_TO_ADDRESS}" style="color: #1a56db;">${EMAIL_REPLY_TO_ADDRESS}</a>.
        </p>
    </div>
    `;
    const emailTextBody = `Olá ${userName},\n\nRecebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.\n\nUse o link a seguir para criar um novo PIN: ${resetPinLink}\n\nEste link é válido até ${expirationTimeLocale}.\n\nSe você não solicitou esta redefinição, ignore este e-mail.\n\nAtenciosamente,\nEquipe JusGestão\nEmail de Suporte: ${EMAIL_REPLY_TO_ADDRESS}\nSite: ${siteUrl}`;

    const emailPayload = {
      from: EMAIL_FROM_ADDRESS,
      to: [user.email],
      subject: emailSubject,
      html: emailHtmlBody,
      text: emailTextBody,
      reply_to: EMAIL_REPLY_TO_ADDRESS,
    };

    console.log("request-finance-pin-reset: Enviando payload para Resend (primeiros 500 chars):", JSON.stringify(emailPayload, null, 2).substring(0, 500) + "...");

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`, // Usando o segredo configurado
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json().catch(() => ({ message: `Erro ${resendResponse.status} ao enviar email e falha ao parsear resposta da API Resend.` }));
      console.error("request-finance-pin-reset: Erro da API Resend:", resendResponse.status, errorData);
      // Incluir mais detalhes do erro da API do Resend se disponíveis
      const resendErrorMessage = errorData.error?.message || errorData.message || `Falha ao enviar email. Status: ${resendResponse.status}`;
      throw new Error(`Erro ao enviar email via Resend: ${resendErrorMessage}`);
    }
    
    const responseData = await resendResponse.json();
    console.log("request-finance-pin-reset: Email enviado com sucesso via Resend API. Resposta:", responseData);

    return new Response(JSON.stringify({
      message: 'Um email com instruções para redefinir seu PIN financeiro foi enviado.',
    }), { status: 200, headers: responseHeaders });

  } catch (error: any) {
    console.error('request-finance-pin-reset: ERRO CAPTURADO NA FUNÇÃO:', error.message, error.stack);
    const errorMessage = error.message || 'Erro interno do servidor ao solicitar reset de PIN.';
    const errorDetails = error.cause ? `Causa: ${error.cause}` : ''; // Inclui a causa do erro se houver

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: errorDetails 
    }), { status: 500, headers: responseHeaders });
  }
});