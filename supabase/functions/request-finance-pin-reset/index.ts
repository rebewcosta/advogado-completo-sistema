
// supabase/functions/request-finance-pin-reset/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://deno.land/std@0.168.0/uuid/mod.ts'; // Import UUID v4 correctly

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080';

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

    // Correctly generate UUID
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

    return new Response(JSON.stringify({
      message: 'Se um email estiver associado a esta conta, um link para redefinir o PIN financeiro foi enviado (VERIFIQUE OS LOGS DA FUNÇÃO NO SUPABASE PARA PEGAR O LINK DE DEBUG).',
      DEBUG_ONLY_link: resetPinLink
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
