
import { loadStripe } from '@stripe/stripe-js';

// Carrega o Stripe com sua chave pública 
// Substitua 'pk_live_SUA_CHAVE' pela sua chave pública real
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
    // 1. Chama o backend para criar uma sessão de checkout
    const response = await fetch('/api/criar-sessao-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomePlano,
        valor,
        emailCliente,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar sessão de checkout');
    }

    const { sessionId } = await response.json();

    // 2. Redireciona para a página de checkout do Stripe
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Não foi possível carregar o Stripe');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Erro ao redirecionar para o checkout:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    throw error;
  }
};
