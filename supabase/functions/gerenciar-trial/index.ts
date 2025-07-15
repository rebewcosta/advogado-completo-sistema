import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verificar se o usuário é admin
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Authentication error: ${userError?.message}`);
    }

    // Verificar se é admin
    if (userData.user.email !== 'webercostag@gmail.com') {
      throw new Error("Access denied: Admin only");
    }

    const { action } = await req.json();

    if (action === 'list_trial_users') {
      // Listar usuários em trial
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      const trialUsers = users.users
        .filter(user => {
          // Filtrar usuários que não são admin nem têm acesso especial
          if (user.email === 'webercostag@gmail.com') return false;
          if (user.user_metadata?.special_access === true) return false;
          if (user.user_metadata?.subscription_status === 'active') return false;
          
          return true;
        })
        .map(user => {
          const userCreatedAt = new Date(user.created_at);
          const customExpirationDate = user.user_metadata?.trial_expiration_date;
          
          let trialEndDate;
          if (customExpirationDate) {
            trialEndDate = new Date(customExpirationDate);
          } else {
            trialEndDate = new Date(userCreatedAt);
            trialEndDate.setDate(trialEndDate.getDate() + 7);
          }
          
          const now = new Date();
          const isExpired = now > trialEndDate;
          const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            trial_end_date: trialEndDate.toISOString(),
            is_expired: isExpired,
            days_remaining: isExpired ? 0 : daysRemaining,
            has_custom_expiration: !!customExpirationDate,
            subscription_status: user.user_metadata?.subscription_status || 'none'
          };
        })
        .sort((a, b) => a.days_remaining - b.days_remaining);

      return new Response(JSON.stringify({ users: trialUsers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === 'set_trial_expiration') {
      const { user_id, expiration_date } = await req.json();
      
      if (!user_id || !expiration_date) {
        throw new Error("user_id and expiration_date are required");
      }

      // Validar data
      const expirationDate = new Date(expiration_date);
      if (isNaN(expirationDate.getTime())) {
        throw new Error("Invalid expiration date");
      }

      // Atualizar metadados do usuário
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: {
          trial_expiration_date: expirationDate.toISOString(),
          trial_modified_by: userData.user.email,
          trial_modified_at: new Date().toISOString()
        }
      });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Trial expiration updated to ${expirationDate.toLocaleDateString('pt-BR')}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === 'remove_custom_expiration') {
      const { user_id } = await req.json();
      
      if (!user_id) {
        throw new Error("user_id is required");
      }

      // Remover data customizada (volta ao padrão de 7 dias)
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: {
          trial_expiration_date: null,
          trial_modified_by: null,
          trial_modified_at: null
        }
      });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Custom expiration removed, reverted to 7-day default" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in gerenciar-trial:", errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});