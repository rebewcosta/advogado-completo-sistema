// supabase/functions/verify-finance-pin-reset-token/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Em produção, restrinja ao seu domínio
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log("verify-finance-pin-reset-token: Função INVOCADA.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("verify-finance-pin-reset-token: ERRO CRÍTICO - Variáveis de ambiente não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente.", valid: false }), {
        status: 500, headers: responseHeaders,
      });
    }

    const { token: resetToken } = await req.json();
    if (!resetToken || typeof resetToken !== 'string') {
      console.warn("verify-finance-pin-reset-token: Token ausente ou malformado no payload.");
      return new Response(JSON.stringify({ error: 'Token de redefinição ausente ou malformado.', valid: false }), {
        status: 400, headers: responseHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    // Precisamos buscar usuários que tenham este token. Como não podemos filtrar metadados diretamente em listUsers,
    // teremos que listar e filtrar, ou usar uma query SQL mais direta se a performance for um problema.
    // Para simplicidade agora, vamos listar. Em produção, considere uma tabela de tokens ou SQL.
    const { data: usersResponse, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        // page: 1, perPage: 1000 // Ajustar paginação se necessário
    });

    if (listError) {
      console.error("verify-finance-pin-reset-token: Erro ao listar usuários:", listError.message);
      throw listError;
    }

    const userWithToken = usersResponse.users.find(u =>
      u.user_metadata?.finance_pin_reset_token === resetToken
    );

    if (!userWithToken) {
      console.log("verify-finance-pin-reset-token: Token não encontrado para nenhum usuário.");
      return new Response(JSON.stringify({ error: 'Token de redefinição inválido.', valid: false }), {
        status: 200, headers: responseHeaders, // 200 para não vazar info, o front trata 'valid: false'
      });
    }

    const expiresAtString = userWithToken.user_metadata?.finance_pin_reset_expires_at as string | undefined;
    if (!expiresAtString || new Date(expiresAtString) < new Date()) {
      console.log(`verify-finance-pin-reset-token: Token expirado para usuário ${userWithToken.id}. Expirou em: ${expiresAtString}`);
      // Opcional: Limpar o token expirado aqui
      // await supabaseAdmin.auth.admin.updateUserById(userWithToken.id, {
      //   user_metadata: {
      //     ...userWithToken.user_metadata,
      //     finance_pin_reset_token: null,
      //     finance_pin_reset_expires_at: null,
      //   }
      // });
      return new Response(JSON.stringify({ error: 'Token de redefinição expirado.', valid: false }), {
        status: 200, headers: responseHeaders,
      });
    }

    console.log(`verify-finance-pin-reset-token: Token válido para usuário ${userWithToken.id}.`);
    return new Response(JSON.stringify({ valid: true, userId: userWithToken.id /* Opcional, mas pode ser útil */ }), {
      status: 200, headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('verify-finance-pin-reset-token: ERRO GERAL INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao verificar token.', valid: false }), {
      status: 500, headers: responseHeaders,
    });
  }
});