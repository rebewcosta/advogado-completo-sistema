// supabase/functions/reset-finance-pin-with-token/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Em produção, restrinja ao seu domínio
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function simpleHash(text: string, salt: string): Promise<string> {
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  console.log("reset-finance-pin-with-token: Função INVOCADA.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
  const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const pinSalt = Deno.env.get('PIN_SALT');

    if (!supabaseUrl || !serviceRoleKey || !pinSalt) {
      console.error("reset-finance-pin-with-token: ERRO CRÍTICO - Variáveis de ambiente não configuradas.");
      return new Response(JSON.stringify({ error: "Configuração crítica do servidor ausente." }), {
        status: 500, headers: responseHeaders,
      });
    }

    const { token: resetToken, newPin } = await req.json();

    if (!resetToken || typeof resetToken !== 'string' || !newPin || typeof newPin !== 'string' || newPin.length !== 4) {
      console.warn("reset-finance-pin-with-token: Payload inválido.");
      return new Response(JSON.stringify({ error: 'Token ou novo PIN ausente/malformado.' }), {
        status: 400, headers: responseHeaders,
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    // Re-verificar o token (similar à função verify-finance-pin-reset-token)
    const { data: usersResponse, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const userWithToken = usersResponse.users.find(u =>
      u.user_metadata?.finance_pin_reset_token === resetToken
    );

    if (!userWithToken) {
      return new Response(JSON.stringify({ error: 'Token de redefinição inválido.' }), {
        status: 400, headers: responseHeaders,
      });
    }

    const expiresAtString = userWithToken.user_metadata?.finance_pin_reset_expires_at as string | undefined;
    if (!expiresAtString || new Date(expiresAtString) < new Date()) {
      return new Response(JSON.stringify({ error: 'Token de redefinição expirado.' }), {
        status: 400, headers: responseHeaders,
      });
    }

    // Se o token é válido e não expirou, redefinir o PIN
    const newPinHashed = await simpleHash(newPin, pinSalt);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userWithToken.id,
      {
        user_metadata: {
          ...userWithToken.user_metadata,
          finance_pin_hash: newPinHashed,
          finance_pin_reset_token: null, // Invalidar token
          finance_pin_reset_expires_at: null, // Invalidar token
        }
      }
    );

    if (updateError) {
      console.error("reset-finance-pin-with-token: Erro ao atualizar PIN e invalidar token:", updateError.message);
      throw updateError;
    }

    console.log(`reset-finance-pin-with-token: PIN financeiro redefinido com sucesso para usuário ${userWithToken.id}.`);
    return new Response(JSON.stringify({ message: 'PIN financeiro redefinido com sucesso.' }), {
      status: 200, headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('reset-finance-pin-with-token: ERRO GERAL INESPERADO:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao redefinir PIN.' }), {
      status: 500, headers: responseHeaders,
    });
  }
});