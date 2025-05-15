
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

// Carrega o Stripe com a chave pública
// Em produção, usa a chave pública de produção
const stripePromise = loadStripe(
  process.env.NODE_ENV === 'production'
    ? 'pk_live_51JDfUhCo82R3GVdGoUZ9LMGKs1l8g2VCOCHfFFXECAHzV3d8DrlYOOHHapBNCtPkRrZizDTAYpW0CdTWfnF4dxZs00YDDLBKm7'
    : 'pk_test_51OvQIeDzU3oOQJJz5qetFrlyRqSTaheaOLz6AHsVboUe1S3Wqw1e25P8JZkCtTjXxyEguLavjGVb9gOLwcCYNOeE00rVzO86sd'
);

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
  modo = process.env.NODE_ENV === 'production' ? 'production' : 'test' // Define automaticamente baseado no ambiente
}: DadosPagamento) => {
  try {
    console.log('Iniciando checkout com:', { nomePlano, valor, emailCliente, modo });
    
    // Indicador de ambiente para o usuário
    const ambiente = modo === 'production' ? 'produção' : 'teste';
    console.log(`Executando em ambiente de ${ambiente}`);
    
    // Chama a edge function do Supabase para criar uma sessão de checkout
    const { data, error } = await supabase.functions.invoke('criar-sessao-checkout', {
      body: {
        nomePlano,
        valor,
        emailCliente,
        modo
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
