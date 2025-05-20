// supabase/functions/set-finance-pin/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { /* ... (sem alterações) ... */ };
// --- COPIE OS HEADERS ACIMA DO SEU CÓDIGO ATUAL ---

async function simpleHash(text: string): Promise<string> {
  const salt = Deno.env.get("PIN_SALT") || "default_salt_please_change_me_in_env"; // Use o salt do ambiente
  const buffer = new TextEncoder().encode(text + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) { /* ... (sem alterações) ... */ }
    // --- COPIE A VERIFICAÇÃO DE URL E KEY ACIMA DO SEU CÓDIGO ATUAL ---

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) { /* ... (sem alterações) ... */ }
    // --- COPIE A VERIFICAÇÃO DO AUTH HEADER ACIMA DO SEU CÓDIGO ATUAL ---
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) { /* ... (sem alterações) ... */ }
    // --- COPIE A VERIFICAÇÃO DO USUÁRIO ACIMA DO SEU CÓDIGO ATUAL ---

    const { currentPin, newPin } = await req.json(); // Agora recebe PINs em texto plano

    if ((!currentPin && user.user_metadata?.finance_pin_hash) || !newPin) {
      return new Response(JSON.stringify({ error: 'PIN atual e novo PIN são obrigatórios se um PIN já existir.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (newPin.length !== 4) {
         return new Response(JSON.stringify({ error: 'Novo PIN deve ter 4 dígitos.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    if (user.user_metadata?.finance_pin_hash && (!currentPin || currentPin.length !== 4)) {
        return new Response(JSON.stringify({ error: 'PIN atual é obrigatório e deve ter 4 dígitos para alterar.' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }


    // Verificar o PIN atual se já existir um PIN configurado
    if (user.user_metadata?.finance_pin_hash) {
      const currentPinHashAttempt = await simpleHash(currentPin);
      if (user.user_metadata.finance_pin_hash !== currentPinHashAttempt) {
        return new Response(JSON.stringify({ error: 'PIN atual incorreto.' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const newPinHashed = await simpleHash(newPin); // Faz o hash do novo PIN

    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, finance_pin_hash: newPinHashed } } // Salva o hash
    );

    if (updateError) { /* ... (sem alterações) ... */ }
    // --- COPIE O TRATAMENTO DE ERRO DE UPDATE ACIMA DO SEU CÓDIGO ATUAL ---

    return new Response(JSON.stringify({ message: 'PIN financeiro atualizado com sucesso.' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) { /* ... (sem alterações) ... */ }
    // --- COPIE O CATCH FINAL ACIMA DO SEU CÓDIGO ATUAL ---
});