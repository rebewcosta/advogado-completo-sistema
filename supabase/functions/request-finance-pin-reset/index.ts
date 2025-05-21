// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para desenvolvimento. Em produção, restrinja à URL do seu app.
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
    // O SITE_URL deve ser configurado nas variáveis de ambiente da sua Edge Function no painel do Supabase.
    // Exemplo: https://sisjusgestao.com.br
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sisjusgestao.com.br'; // Adicionado fallback para seu domínio

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("request-finance-pin-reset: ERRO - Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }

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

    // Gerando token de reset
    const resetToken = uuidv4();
    console.log("request-finance-pin-reset: Token gerado:", resetToken);

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

    // Usar inviteUserByEmail para enviar o email.
    // Você precisará personalizar o template "Invite user" no seu painel Supabase.
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      user.email, // Email do destinatário
      {
        data: { // Estes dados estarão disponíveis no seu template de email
          user_name: user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário",
          reset_pin_url: resetPinLink,
          expires_at_locale: new Date(expiresAt).toLocaleString("pt-BR", { dateStyle: 'full', timeStyle: 'short'}),
          // O assunto do email será o que você configurar no template "Invite User" no Supabase
        },
        // redirectTo: resetPinLink // Opcional, se o seu template de convite tiver um botão principal
                                 // que usa {{ .ConfirmationURL }}. Para este caso, é melhor
                                 // ter o reset_pin_url diretamente no corpo do email.
      }
    );

    if (emailError) {
      console.error("request-finance-pin-reset: Erro ao enviar email via inviteUserByEmail:", emailError.message);
      // Mesmo com erro de email, o token foi gerado e salvo.
      // Considere como tratar isso: o usuário não receberá o email, mas o token é válido.
      return new Response(JSON.stringify({
        message: 'Ocorreu um erro ao enviar o email de redefinição. Por favor, tente novamente mais tarde ou contate o suporte.',
        error: emailError.message,
        DEBUG_ONLY_link: resetPinLink // Para depuração, você pode querer ver o link gerado
      }), {
        status: 500, // Ou 200 com uma mensagem de erro específica
        headers: responseHeaders,
      });
    }

    console.log(`request-finance-pin-reset: Email de redefinição de PIN (via template de convite) enviado para ${user.email}.`);

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