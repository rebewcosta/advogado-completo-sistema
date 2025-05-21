// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts'; // Para gerar tokens únicos

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Em produção, restrinja ao seu domínio
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log("request-finance-pin-reset: Função INVOCADA.");

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080'; // URL base do seu app frontend

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

    const resetToken = uuidv4.generate(); // Gera um token UUID v4
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

    // Lógica de Envio de Email (Supabase Auth tem um sistema de templates para isso)
    // Para simplificar aqui, vamos assumir que o Supabase Auth tem um template para 'recovery'
    // que pode ser adaptado ou você pode usar um provedor de email externo.
    // Se usar o sistema do Supabase para senhas, pode não ser direto para PINs.
    // A forma mais simples é enviar o email diretamente daqui usando um provider ou o `supabase.functions.invoke('send-email-function', ...)`
    // Por enquanto, vamos apenas retornar sucesso e o link que seria enviado.
    // Em um sistema real, aqui você chamaria `await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: resetLink })`
    // mas como é para PIN, e não senha do SupABASE, o fluxo é um pouco diferente.
    // Vamos construir o link e você pode enviar manualmente ou com outra função.

    const resetPinLink = `<span class="math-inline">\{siteUrl\}/redefinir\-pin\-financeiro?token\=</span>{resetToken}`;

    // IMPORTANTE: Implementar o envio de email real aqui.
    // Exemplo conceitual (você precisaria de uma função para enviar email ou usar um provider):
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Redefinição do seu PIN Financeiro - JusGestão',
    //   html: `
    //     <p>Olá <span class="math-inline">\{user\.user\_metadata?\.nome \|\| user\.email\},</p\>
//     <p>Recebemos uma solicitação para redefinir o PIN financeiro da sua conta JusGestão.</p>
//     <p>Clique no link abaixo para criar um novo PIN:</p>
//     <p><a href="{resetPinLink}">${resetPinLink}</a></p>
//     <p>Este link é válido por 1 hora.</p>
//     <p>Se você não solicitou esta redefinição, por favor, ignore este e-mail.</p>
//     <p>Atenciosamente,<br>Equipe JusGestão</p>
//   `
// });

    console.log(`request-finance-pin-reset: Email de reset de PIN (simulado) enviado para ${user.email}. Link: ${resetPinLink}`);

    return new Response(JSON.stringify({
      message: 'Se um email estiver associado a esta conta, um link para redefinir o PIN financeiro foi enviado.',
      // DEBUG_ONLY_link: resetPinLink // Remova em produção
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