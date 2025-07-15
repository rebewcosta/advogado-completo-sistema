import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuração do Supabase não encontrada');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verificar autenticação do usuário
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { action, enabled } = await req.json();

    if (action === 'toggle') {
      if (typeof enabled !== 'boolean') {
        throw new Error('Parâmetro "enabled" deve ser um booleano');
      }

      // Se está desabilitando o PIN, remover o PIN existente
      if (!enabled) {
        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              finance_pin_hash: null,
              finance_pin_enabled: false
            }
          }
        );

        if (updateError) {
          throw new Error('Erro ao desabilitar PIN: ' + updateError.message);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'PIN desabilitado com sucesso',
            enabled: false
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      } else {
        // Se está habilitando o PIN, apenas marcar como habilitado
        // O usuário precisará definir um PIN depois
        const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              finance_pin_enabled: true
            }
          }
        );

        if (updateError) {
          throw new Error('Erro ao habilitar PIN: ' + updateError.message);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'PIN habilitado com sucesso. Defina seu PIN de 4 dígitos.',
            enabled: true
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    } else if (action === 'status') {
      // Retornar status atual do PIN
      const pinEnabled = user.user_metadata?.finance_pin_enabled !== false; // Default é true
      const hasPin = !!user.user_metadata?.finance_pin_hash;

      return new Response(
        JSON.stringify({ 
          success: true,
          enabled: pinEnabled,
          hasPin: hasPin
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    } else {
      throw new Error('Ação inválida. Use "toggle" ou "status"');
    }

  } catch (error: any) {
    console.error('Erro na função manage-finance-pin-settings:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});