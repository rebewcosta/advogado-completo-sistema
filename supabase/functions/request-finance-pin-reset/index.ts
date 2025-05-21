// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

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
    // VOCÊ PRECISARÁ ADICIONAR A CHAVE DE API DO SEU SERVIÇO DE EMAIL NOS SEGREDOS DA FUNÇÃO
    // Exemplo: const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("request-finance-pin-reset: ERRO - Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }
    // Adicione a verificação da sua chave de API de email aqui
    // if (!RESEND_API_KEY) { // Exemplo com Resend
    //   console.error("request-finance-pin-reset: ERRO - Chave de API do serviço de email não configurada.");
    //   return new Response(JSON.stringify({ error: "Configuração de envio de email ausente." }), {
    //     status: 500, headers: responseHeaders,
    //   });
    // }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("request-finance-pin-reset: Token de autenticação ausente ou malformado.");
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401, headers: responseHeaders,
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("request-finance-pin-reset: Erro ao obter usuário:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado.' }), {
        status: 401, headers: responseHeaders,
      });
    }

    if (!user.email) {
        console.error("request-finance-pin-reset: Usuário não possui email cadastrado.");
        return new Response(JSON.stringify({ error: 'Usuário não possui email para envio do link.' }), {
            status: 400, headers: responseHeaders,
        });
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

    // --- SUBSTITUA ESTA SEÇÃO PELA LÓGICA DE ENVIO DE EMAIL DO SEU PROVEDOR ---
    let emailSentSuccessfully = false;
    let emailErrorFromService: string | null = null;

    try {
      // Exemplo conceitual (você precisará adaptar para o seu provedor de email, ex: Resend, SendGrid)
      // const emailPayload = {
      //   from: 'JusGestão <suporte@sisjusgestao.com.br>',
      //   to: [user.email],
      //   subject: 'Redefinir seu PIN Financeiro - JusGestão',
      //   html: `
      //     <h2>Redefinição de PIN Financeiro</h2>
      //     <p>Olá ${userName},</p>
      //     <p>Recebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.</p>
      //     <p>Clique no link abaixo para criar um novo PIN:</p>
      //     <p><a href="${resetPinLink}">Redefinir meu PIN Financeiro</a></p>
      //     <p>Este link é válido até ${expirationTimeLocale}.</p>
      //     <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
      //     <p>Atenciosamente,<br>Equipe JusGestão</p>
      //   `,
      //   // text: `Olá ${userName}, ... seu link: ${resetPinLink}` // Versão em texto puro
      // };

      // // Supondo que você use 'fetch' para chamar a API do seu provedor de email:
      // const response = await fetch('URL_DA_API_DO_SEU_PROVEDOR_DE_EMAIL', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${Deno.env.get('SUA_CHAVE_DE_API_EMAIL')}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(emailPayload),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || `Erro ${response.status} ao enviar email.`);
      // }
      // const emailResponseData = await response.json();
      // console.log("request-finance-pin-reset: Email enviado com sucesso via serviço de terceiros:", emailResponseData);
      // emailSentSuccessfully = true;

      // POR ENQUANTO, COMO NÃO TEMOS A INTEGRAÇÃO, VAMOS SIMULAR UM ERRO PARA VOCÊ IMPLEMENTAR
      // Remova esta linha quando implementar o envio real:
      throw new Error("Lógica de envio de email de terceiros ainda não implementada.");

    } catch (err) {
      console.error("request-finance-pin-reset: Erro ao tentar enviar email via serviço de terceiros:", err);
      emailErrorFromService = err.message;
    }
    // --- FIM DA SEÇÃO DE ENVIO DE EMAIL ---


    if (!emailSentSuccessfully) {
      console.error("request-finance-pin-reset: Falha no envio do email:", emailErrorFromService);
      return new Response(JSON.stringify({
        message: 'Ocorreu um erro ao enviar o email de redefinição. Por favor, tente novamente mais tarde ou contate o suporte.',
        error: emailErrorFromService || "Erro desconhecido no envio de email.",
        DEBUG_ONLY_link: resetPinLink
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