
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [WEBHOOK-STRIPE] ${step}${detailsStr}`);
};

export async function handleSubscriptionEvent(event: Stripe.Event, supabase: any, stripe: Stripe) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  logStep(`🔄 Processando assinatura`, { 
    eventType: event.type,
    subscriptionId: subscription.id, 
    status: subscription.status 
  });

  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (!customer.email) {
      logStep("❌ Email do cliente não encontrado");
      return;
    }

    // Buscar usuário pelo email usando listUsers
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Usar um limite alto para buscar todos os usuários se necessário
    });
    
    if (userError) {
      logStep("❌ Erro ao buscar usuários", { error: userError.message });
      return;
    }
    
    const user = usersData.users.find(u => u.email === customer.email);
    
    if (!user) {
      logStep("❌ Usuário não encontrado", { email: customer.email });
      return;
    }

    logStep(`✅ Usuário encontrado`, { userId: user.id, email: customer.email });

    // Preparar dados de atualização
    const subscriptionData = {
      subscription_status: subscription.status,
      stripe_customer_id: customerId,
      current_period_end: subscription.current_period_end,
      subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    };

    // Lógica específica por status
    if (subscription.status === 'past_due') {
      subscriptionData.past_due_since = new Date().toISOString();
      logStep(`⚠️ Assinatura em atraso - iniciando contagem de 5 dias`, { email: customer.email });
    }

    if (subscription.status === 'canceled') {
      subscriptionData.canceled_at = new Date().toISOString();
      subscriptionData.cancellation_reason = event.type === 'customer.subscription.deleted' ? 'automatic_nonpayment' : 'manual';
      subscriptionData.past_due_since = null;
      subscriptionData.payment_failed_at = null;
      logStep(`❌ Assinatura cancelada`, { email: customer.email, reason: subscriptionData.cancellation_reason });
    }

    if (subscription.status === 'active') {
      // Limpar flags de problema quando ativa
      subscriptionData.past_due_since = null;
      subscriptionData.payment_failed_at = null;
      subscriptionData.payment_recovered_at = new Date().toISOString();
      logStep(`✅ Assinatura ativada/recuperada`, { email: customer.email });
    }

    // Atualizar metadados do usuário
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          ...subscriptionData
        }
      }
    );

    if (updateError) {
      logStep("❌ Erro ao atualizar usuário", { error: updateError.message });
      throw updateError;
    } else {
      logStep("✅ Usuário atualizado com sucesso", { 
        userId: user.id, 
        status: subscription.status 
      });
    }

  } catch (error) {
    logStep("❌ Erro ao processar evento de assinatura", { 
      error: error.message,
      subscriptionId: subscription.id
    });
    throw error;
  }
}

export async function handleInvoiceEvent(event: Stripe.Event, supabase: any, stripe: Stripe) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;

  logStep(`🧾 Processando fatura`, { 
    eventType: event.type,
    invoiceId: invoice.id, 
    status: invoice.status,
    amount: invoice.amount_paid
  });

  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (!customer.email) {
      logStep("❌ Email do cliente não encontrado na fatura");
      return;
    }

    // Buscar usuário pelo email usando listUsers
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (listError) {
      logStep("❌ Erro ao buscar usuários", { error: listError.message });
      return;
    }
    
    const user = usersData.users.find(u => u.email === customer.email);
    
    if (!user) {
      logStep("❌ Usuário não encontrado para fatura", { email: customer.email });
      return;
    }

    if (event.type === "invoice.payment_failed") {
      await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString(),
            past_due_since: new Date().toISOString()
          }
        }
      );
      logStep(`⚠️ Pagamento falhou - iniciando contagem de 5 dias`, { 
        email: customer.email,
        invoiceId: invoice.id
      });
    }

    if (event.type === "invoice.payment_succeeded") {
      // Limpar flags de problema quando pagamento é bem-sucedido
      const updateData = {
        ...user.user_metadata,
        subscription_status: 'active',
        payment_failed_at: null,
        past_due_since: null,
        payment_recovered_at: new Date().toISOString()
      };

      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: updateData
      });
      
      logStep(`✅ Pagamento bem-sucedido - inadimplência cancelada`, { 
        email: customer.email,
        amount: invoice.amount_paid / 100
      });
    }

  } catch (error) {
    logStep("❌ Erro ao processar evento de fatura", { 
      error: error.message,
      invoiceId: invoice.id
    });
    throw error;
  }
}
