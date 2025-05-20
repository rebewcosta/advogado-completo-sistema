// supabase/functions/set-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; // Ou a versão que você está usando
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'; // Ou a versão que você está usando

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para desenvolvimento. EM PRODUÇÃO: 'https://sisjusgestao.com.br'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function simpleHash(text: string): Promise<string> {
  const salt = Deno.env.get("PIN_SALT");
  if (!salt) {
    console.error("set-finance-pin: PIN_SALT não está definido nas variáveis de ambiente da função!");
    // Lançar um erro aqui ou usar um default menos seguro é uma decisão de design,
    // mas para segurança, é melhor falhar se o salt não estiver definido.
    throw new Error("Configuração de segurança do servidor incompleta (salt ausente).");
  }
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  // Tratar requisições OPTIONS (CORS preflight) explicitamente no início
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("set-finance-pin: Supabase URL ou Service Role Key não encontradas.");
      // Não precisa de JSON.stringify aqui se o corpo for uma string simples
      return new Response("Configuração do servidor da função incompleta.", {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, // Manter JSON para consistência
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autenticação ausente ou malformado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error("set-finance-pin: Erro ao obter usuário ou usuário não encontrado:", userError?.message);
      return new Response(JSON.stringify({ error: userError?.message || 'Usuário não autenticado ou não encontrado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Garantir que o corpo da requisição é JSON
    let payload;
    try {
        payload = await req.json();
    } catch (e) {
        console.error("set-finance-pin: Erro ao parsear corpo da requisição JSON:", e.message);
        return new Response(JSON.stringify({ error: 'Corpo da requisição inválido ou não é JSON.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { currentPin, newPin } = payload;

    if (!newPin || typeof newPin !== 'string' || newPin.length !== 4) {
      return new Response(JSON.stringify({ error: 'Novo PIN é obrigatório e deve ser uma string de 4 dígitos.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existingPinHash = user.user_metadata?.finance_pin_hash;

    if (existingPinHash) {
      if (!currentPin || typeof currentPin !== 'string' || currentPin.length !== 4) {
        return new Response(JSON.stringify({ error: 'PIN atual é obrigatório e deve ser uma string de 4 dígitos para alterar um PIN existente.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const currentPinHashAttempt = await simpleHash(currentPin);
      if (existingPinHash !== currentPinHashAttempt) {
        return new Response(JSON.stringify({ error: 'PIN atual incorreto.' }), {
          status: 403, // Forbidden
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const newPinHashed = await simpleHash(newPin);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, finance_pin_hash: newPinHashed } }
    );

    if (updateError) {
      console.error("set-finance-pin: Erro ao atualizar metadados do usuário:", updateError.message);
      return new Response(JSON.stringify({ error: `Erro ao atualizar PIN: ${updateError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'PIN financeiro atualizado com sucesso.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('set-finance-pin: Erro inesperado na função:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor ao definir PIN.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});