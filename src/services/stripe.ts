
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Carrega o Stripe com a chave pública
// Substitua pela chave pública real do Stripe (essa é segura para ser exposta no frontend)
const stripePromise = loadStripe('pk_test_51JDfUhCo82R3GVdGoUZ9LMGKs1l8g2VCOCHfFFXECAHzV3d8DrlYOOHHapBNCtPkRrZizDTAYpW0CdTWfnF4dxZs00YDDLBKm7');

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
    console.log('Iniciando checkout com:', { nomePlano, valor, emailCliente });
    
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

    console.log('Sessão de checkout criada com sucesso:', data);
    
    // Abre o Stripe checkout em uma nova guia
    window.open(data.url, '_blank');
    
    return data;
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    throw error;
  }
};
