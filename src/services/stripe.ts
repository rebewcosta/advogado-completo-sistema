
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Carrega o Stripe com sua chave pública
// Substitua pela sua chave pública real do painel do Stripe
const stripePromise = loadStripe('pk_live_SUA_CHAVE');

interface DadosPagamento {
  nomePlano: string;
  valor: number;
  emailCliente: string;
}

export const iniciarCheckout = async ({
  nomePlano = 'Plano Mensal JusGestão',
  valor = 12700, // R$ 127,00 em centavos
  emailCliente
}: DadosPagamento) => {
  try {
    // Chama a edge function do Supabase para criar uma sessão de checkout
    const { data, error } = await supabase.functions.invoke('criar-sessao-checkout', {
      body: {
        nomePlano,
        valor,
        emailCliente,
      }
    });

    if (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw new Error(error.message || 'Erro ao criar sessão de checkout');
    }

    if (!data || !data.url) {
      throw new Error('Resposta inválida da API de checkout');
    }

    // Abre o Stripe checkout em uma nova guia
    window.open(data.url, '_blank');
    
    return data;
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    throw error;
  }
};
