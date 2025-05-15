
import { loadStripe } from '@stripe/stripe-js';

// Chave pública do Stripe. Não é um segredo, é seguro usá-la no frontend.
// No ambiente de produção, você deve substituir por sua chave pública real
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export const iniciarPagamento = async (
  valorEmCentavos: number,
  descricao: string,
  emailCliente: string
) => {
  try {
    // Em uma aplicação real, você enviaria uma requisição para o seu servidor/backend
    // que por sua vez criaria a sessão de checkout no Stripe
    
    // Simulação da resposta do servidor que contém a ID da sessão
    const resposta = await fetch('https://api.seu-backend.com/criar-sessao-pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valorEmCentavos,
        descricao,
        emailCliente,
      }),
    });

    const { sessionId } = await resposta.json();
    
    // Inicializa o Stripe e redireciona para a página de checkout
    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('Erro ao redirecionar para o checkout:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
};
