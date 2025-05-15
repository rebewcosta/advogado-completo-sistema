
import { serve } from "https://deno.land/std@0.184.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@11.1.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const customDomain = Deno.env.get("CUSTOM_DOMAIN") || "sisjusgestao.com.br";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Cabeçalhos CORS para permitir requisições de qualquer origem
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cliente Supabase com chave de serviço para operações admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req: Request) => {
  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Verificar se é uma requisição POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não permitido" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obter o cabeçalho com a assinatura do Stripe
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Assinatura Stripe ausente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obter o corpo da requisição como texto
    const body = await req.text();
    
    // Validar a assinatura do webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Erro na verificação da assinatura do webhook: ${err.message}`);
      return new Response(JSON.stringify({ error: `Assinatura inválida: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Processar diferentes tipos de eventos do Stripe
    console.log(`Evento recebido: ${event.type}`);

    // Extrair dados comuns
    const { id: stripe_event_id, type: event_type, created: event_timestamp } = event;
    
    // Log do evento recebido na tabela de log (optional, você pode criar essa tabela depois)
    // await supabaseAdmin.from("stripe_events_log").insert({ 
    //   stripe_event_id,
    //   event_type,
    //   event_timestamp,
    //   event_data: event.data.object
    // });

    // Processar eventos com base no tipo
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // Processar checkout completado
        console.log("Checkout completado:", session.id);
        
        if (session.client_reference_id) {
          // O client_reference_id deve conter o user_id
          const userId = session.client_reference_id;
          
          // Verificar se é uma assinatura
          if (session.subscription) {
            // Registrar a assinatura no banco de dados do usuário
            // Em um projeto real, você criaria uma tabela 'subscriptions' para armazenar estes dados
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            console.log(`Assinatura ${subscription.id} ativada para o usuário ${userId}`);

            // Atualizar os metadados do usuário para indicar assinatura ativa
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              user_metadata: { 
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
              }
            });
          }
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(`Assinatura atualizada: ${subscription.id}`);
        
        // Encontrar o usuário que possui essa assinatura (através de uma consulta ou dos metadados)
        // Em um caso real, você teria uma tabela de assinaturas para fazer uma busca mais eficiente
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.error("Erro ao buscar usuários:", error);
          break;
        }
        
        // Encontrar o usuário com esta assinatura
        const user = users.users.find(u => 
          u.user_metadata?.subscription_id === subscription.id
        );
        
        if (user) {
          // Atualizar o status da assinatura nos metadados do usuário
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: { 
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            }
          });
          
          console.log(`Status da assinatura atualizado para o usuário ${user.id}: ${subscription.status}`);
        } else {
          console.warn(`Usuário não encontrado para a assinatura ${subscription.id}`);
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log(`Assinatura cancelada: ${subscription.id}`);
        
        // Encontrar o usuário que possui essa assinatura
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.error("Erro ao buscar usuários:", error);
          break;
        }
        
        // Encontrar o usuário com esta assinatura
        const user = users.users.find(u => 
          u.user_metadata?.subscription_id === subscription.id
        );
        
        if (user) {
          // Atualizar os metadados do usuário para indicar que não possui mais assinatura
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: { 
              subscription_id: subscription.id,
              subscription_status: "canceled",
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            }
          });
          
          console.log(`Assinatura marcada como cancelada para o usuário ${user.id}`);
        } else {
          console.warn(`Usuário não encontrado para a assinatura ${subscription.id}`);
        }
        break;
      }
      
      // Outros eventos que você pode querer tratar:
      // case "invoice.payment_succeeded":
      // case "invoice.payment_failed":
      // case "customer.created":
      // etc.

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    // Responder com sucesso
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Erro no webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
