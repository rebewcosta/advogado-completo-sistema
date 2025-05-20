// supabase/functions/set-finance-pin/index.ts (TESTE MÍNIMO)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  console.log(`--- TESTE set-finance-pin INVOCADA --- Método: ${req.method}`);

  if (req.method === 'OPTIONS') {
    console.log("--- TESTE set-finance-pin: Respondendo a OPTIONS ---");
    return new Response('ok OPTIONS', { headers: corsHeaders });
  }

  // Para qualquer outro método (como POST)
  console.log("--- TESTE set-finance-pin: Respondendo a POST/outro ---");
  try {
    const body = await req.json(); // Tenta ler o corpo só para ver se chega aqui
    console.log("--- TESTE set-finance-pin: Corpo recebido ---", body);
  } catch (e) {
    console.log("--- TESTE set-finance-pin: Não foi possível ler o corpo JSON ou não havia corpo ---", e.message);
  }

  return new Response(JSON.stringify({ message: 'Função set-finance-pin de TESTE MÍNIMO respondeu!' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});