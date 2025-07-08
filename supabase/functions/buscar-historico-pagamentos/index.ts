
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Buscando histórico de pagamentos...");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token de autorização necessário");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user?.email) {
      throw new Error("Usuário não autenticado");
    }

    console.log("✅ Usuário autenticado:", userData.user.email);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Buscar cliente no Stripe
    const customers = await stripe.customers.list({
      email: userData.user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log("⚠️ Cliente não encontrado no Stripe");
      return new Response(JSON.stringify({
        pagamentos: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("✅ Cliente encontrado:", customerId);

    // Buscar faturas do cliente
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
      expand: ['data.payment_intent']
    });

    console.log(`✅ Encontradas ${invoices.data.length} faturas`);

    const pagamentos = invoices.data.map(invoice => {
      const paymentMethod = invoice.payment_intent?.payment_method_types?.[0] || 'card';
      const periodo = invoice.period_start && invoice.period_end 
        ? `${new Date(invoice.period_start * 1000).toLocaleDateString('pt-BR')} - ${new Date(invoice.period_end * 1000).toLocaleDateString('pt-BR')}`
        : 'N/A';

      return {
        id: invoice.id,
        data: new Date(invoice.created * 1000).toISOString(),
        valor: invoice.total,
        status: invoice.status === 'paid' ? 'paid' : 
               invoice.status === 'open' ? 'pending' : 'failed',
        metodo: paymentMethod === 'card' ? 'Cartão de Crédito' : 
               paymentMethod === 'boleto' ? 'Boleto' : 'Outros',
        periodo: periodo,
        invoice_url: invoice.hosted_invoice_url
      };
    });

    console.log(`✅ Processados ${pagamentos.length} pagamentos`);

    return new Response(JSON.stringify({
      pagamentos: pagamentos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    
    return new Response(JSON.stringify({
      error: error.message || "Erro interno do servidor"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
