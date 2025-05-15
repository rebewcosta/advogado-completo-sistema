
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

// Carrega o Stripe com a chave pública
const stripePromise = loadStripe('pk_test_51OvQIeDzU3oOQJJz5qetFrlyRqSTaheaOLz6AHsVboUe1S3Wqw1e25P8JZkCtTjXxyEguLavjGVb9gOLwcCYNOeE00rVzO86sd');

interface DadosPagamento {
  nomePlano: string;
  valor: number;
  emailCliente: string;
  modo?: 'production' | 'test';
}

export const iniciarCheckout = async ({
  nomePlano = 'Plano Mensal JusGestão',
  valor = 12700, // R$ 127,00 em centavos
  emailCliente,
  modo = 'production' // Define modo padrão como produção
}: DadosPagamento) => {
  try {
    console.log('Iniciando checkout com:', { nomePlano, valor, emailCliente, modo });
    
    // Usar o modo especificado sem forçar teste
    const modoFinal = modo;
    
    // Indicador de ambiente para o usuário
    console.log(`Executando em ambiente ${modoFinal}`);
    
    // Chama a edge function do Supabase para criar uma sessão de checkout
    const { data, error } = await supabase.functions.invoke('criar-sessao-checkout', {
      body: {
        nomePlano,
        valor,
        emailCliente,
        modo: modoFinal // Usar o modo especificado
      }
    });

    if (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      throw new Error(`Erro ao criar sessão de checkout: ${error.message || JSON.stringify(error)}`);
    }

    if (!data || !data.url) {
      console.error('Resposta inválida da API de checkout:', data);
      throw new Error('Resposta inválida da API de checkout: ' + JSON.stringify(data));
    }

    console.log('Sessão de checkout criada com sucesso:', data);
    
    // Retorna os dados para que o componente possa fazer o redirecionamento
    return data;
  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Detalhes completos do erro:', error);
    
    toast({
      title: "Erro ao iniciar pagamento",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};

export const abrirPortalCliente = async () => {
  try {
    console.log('Abrindo portal do cliente Stripe');
    
    // Chama a edge function do Supabase para criar uma sessão do portal do cliente
    const { data, error } = await supabase.functions.invoke('criar-portal-cliente');

    if (error) {
      console.error('Erro ao criar sessão do portal do cliente:', error);
      throw new Error(`Erro ao criar sessão do portal: ${error.message || JSON.stringify(error)}`);
    }

    if (!data || !data.url) {
      console.error('Resposta inválida da API do portal:', data);
      throw new Error('Resposta inválida da API do portal: ' + JSON.stringify(data));
    }

    console.log('Sessão do portal criada com sucesso:', data);
    
    // Retorna a URL do portal
    return data.url;
  } catch (error) {
    console.error('Erro ao abrir portal do cliente:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Detalhes completos do erro:', error);
    
    toast({
      title: "Erro ao abrir portal do cliente",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};
