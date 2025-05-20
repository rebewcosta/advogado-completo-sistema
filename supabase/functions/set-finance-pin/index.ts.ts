// supabase/functions/set-finance-pin/index.ts (TESTE MÍNIMO ABSOLUTO NO PAINEL)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
console.log("set-finance-pin (TESTE MÍNIMO): Função está sendo carregada/inicializada no Deno runtime.");
serve(async (req)=>{
  console.log(`set-finance-pin (TESTE MÍNIMO): Requisição recebida! Método: ${req.method}, URL: ${req.url}`);
  if (req.method === 'OPTIONS') {
    console.log("set-finance-pin (TESTE MÍNIMO): É uma requisição OPTIONS. Respondendo com headers CORS.");
    return new Response('ok preflight', {
      headers: corsHeaders
    }); // status 200 ou 204
  }
  // Para qualquer outro método (como POST)
  console.log("set-finance-pin (TESTE MÍNIMO): É uma requisição POST (ou outra). Respondendo...");
  try {
    let bodyText = "Nenhum corpo JSON ou erro ao ler.";
    try {
      const body = await req.json();
      bodyText = JSON.stringify(body);
      console.log("set-finance-pin (TESTE MÍNIMO): Corpo recebido:", bodyText);
    } catch (e) {
      console.log("set-finance-pin (TESTE MÍNIMO): Não foi possível ler corpo JSON:", e.message);
    }
    return new Response(JSON.stringify({
      message: 'Função set-finance-pin de TESTE MÍNIMO respondeu!',
      method: req.method,
      receivedBody: bodyText
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.error("set-finance-pin (TESTE MÍNIMO): Erro inesperado:", e.message);
    return new Response(JSON.stringify({
      error: "Erro interno na função de teste mínimo.",
      details: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
