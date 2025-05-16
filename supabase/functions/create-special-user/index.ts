// supabase/functions/create-special-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"; // Use a versão do Deno std compatível
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'; // Use a versão do supabase-js compatível

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para desenvolvimento. Em produção, restrinja à URL do seu app.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Adicionar OPTIONS e POST
};

console.log("Edge Function 'create-special-user' inicializada.");

serve(async (req: Request) => {
  // Tratar requisição OPTIONS (pre-flight CORS)
  if (req.method === 'OPTIONS') {
    console.log("Recebida requisição OPTIONS para create-special-user");
    return new Response('ok', { headers: corsHeaders });
  }

  // Garantir que é uma requisição POST
  if (req.method !== 'POST') {
    console.warn(`Método ${req.method} não permitido para create-special-user.`);
    return new Response(JSON.stringify({ error: "Método não permitido. Use POST." }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { email, password, metadata } = body;

    console.log("Recebido para create-special-user:", { email, metadata });

    if (!email || !password) {
      console.error("Email ou senha ausentes na requisição para create-special-user.");
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pegar as variáveis de ambiente do Supabase (elas são configuradas no painel do Supabase)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.");
      throw new Error("Configuração do servidor incompleta.");
    }

    // Criar cliente Supabase com a CHAVE DE SERVIÇO (ADMIN)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verificar se quem está chamando esta função é o administrador principal
    // Isso adiciona uma camada de segurança
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("Cabeçalho de autorização ausente ou malformado na chamada para create-special-user.");
      return new Response(JSON.stringify({ error: "Não autorizado: token de acesso ausente." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: adminUserError } = await supabaseAdmin.auth.getUser(token);

    if (adminUserError || !adminUser) {
      console.warn("Erro ao verificar usuário admin ou usuário admin não encontrado:", adminUserError?.message);
      return new Response(JSON.stringify({ error: "Não autorizado: " + (adminUserError?.message || 'Usuário admin inválido.') }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // APENAS O ADMIN ESPECÍFICO PODE CRIAR CONTAS ESPECIAIS
    if (adminUser.email !== 'webercostag@gmail.com') {
      console.warn(`Tentativa não autorizada de criar conta especial por: ${adminUser.email}`);
      return new Response(JSON.stringify({ error: "Apenas o administrador principal pode criar contas especiais." }), {
        status: 403, // Forbidden
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Admin ${adminUser.email} autorizado. Criando conta para ${email}.`);
    console.log("Metadados recebidos na função:", metadata);
    console.log("Valor de skip_email_confirmation nos metadados:", metadata?.skip_email_confirmation);

    const shouldConfirmEmail = metadata?.skip_email_confirmation === true;
    console.log("Usuário será criado com email_confirm:", shouldConfirmEmail);

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: shouldConfirmEmail, // Pula a confirmação se skip_email_confirmation for true
      user_metadata: metadata || {},   // Salva todos os metadados, incluindo special_access
    });

    if (createError) {
      console.error("Erro do Supabase ao criar usuário (admin.createUser):", createError.message, createError);
      if (createError.message.includes("User already registered") || (createError.message.includes("duplicate key value") && createError.message.includes("users_email_key"))) {
        return new Response(JSON.stringify({ error: "Este email já está registrado." }), {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Para outros erros, jogue para o catch genérico
      throw createError;
    }

    console.log("Conta especial criada com sucesso pela Edge Function:", createData.user?.email);
    return new Response(JSON.stringify({ user: createData.user, message: `Conta especial para ${email} criada com sucesso.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Erro na Edge Function create-special-user (catch geral):', error.message, error);
    return new Response(JSON.stringify({
      error: "Erro interno do servidor ao criar conta especial.",
      details: error.message // Evite expor error.stack em produção se não for necessário
    }), {
      status: 500, // Erro genérico do servidor
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
