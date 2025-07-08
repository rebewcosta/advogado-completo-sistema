
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔄 Enviando email de assinatura...");

    const { tipo, email, nome, dados } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    let subject = "";
    let html = "";
    const baseUrl = Deno.env.get("SITE_URL") || "https://sisjusgestao.com.br";

    switch (tipo) {
      case "conta_cancelada":
        subject = "⚠️ Sua conta JusGestão foi cancelada - Reative agora";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Conta Cancelada - JusGestão</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #dc2626, #ea580c); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">⚠️ Conta Cancelada</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">JusGestão - Sistema para Advogados</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Olá <strong>${nome}</strong>,</p>
                  
                  <p>Sua conta no JusGestão foi cancelada automaticamente após 5 dias de inadimplência.</p>
                  
                  <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="color: #856404; margin-top: 0;">📋 Resumo da Situação:</h3>
                      <ul style="color: #856404; margin: 0;">
                          <li>Conta cancelada por falta de pagamento</li>
                          <li>Todos os seus dados estão preservados por 30 dias</li>
                          <li>Você pode reativar a qualquer momento</li>
                      </ul>
                  </div>
                  
                  <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="color: #0c5460; margin-top: 0;">🔄 Como Reativar:</h3>
                      <ol style="color: #0c5460; margin: 0;">
                          <li>Clique no botão "Reativar Conta" abaixo</li>
                          <li>Complete o pagamento de R$ 37,00</li>
                          <li>Aguarde alguns minutos para ativação</li>
                          <li>Faça login normalmente</li>
                      </ol>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${baseUrl}/conta-cancelada" style="background: linear-gradient(135deg, #16a34a, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                          🔄 Reativar Conta Agora
                      </a>
                  </div>
                  
                  <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p style="color: #721c24; margin: 0;">
                          <strong>⏰ Prazo:</strong> Você tem 30 dias para reativar antes da exclusão permanente dos dados.
                      </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                  
                  <p style="color: #6c757d; font-size: 14px; text-align: center;">
                      Precisa de ajuda? Responda este email ou entre em contato:<br>
                      📧 suporte@jusgestao.com.br<br>
                      🌐 ${baseUrl}
                  </p>
              </div>
          </body>
          </html>
        `;
        break;

      case "pagamento_falhou":
        subject = "💳 Problema no pagamento - JusGestão";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Problema no Pagamento - JusGestão</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">💳 Problema no Pagamento</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">JusGestão - Sistema para Advogados</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Olá <strong>${nome}</strong>,</p>
                  
                  <p>Não conseguimos processar o pagamento da sua assinatura JusGestão.</p>
                  
                  <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="color: #856404; margin-top: 0;">⚠️ Ação Necessária:</h3>
                      <ul style="color: #856404; margin: 0;">
                          <li>Verifique se seu cartão está ativo</li>
                          <li>Confirme se há limite disponível</li>
                          <li>Atualize os dados do cartão se necessário</li>
                          <li>Você tem 5 dias para resolver</li>
                      </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${baseUrl}/configuracoes" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                          💳 Atualizar Pagamento
                      </a>
                  </div>
                  
                  <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p style="color: #721c24; margin: 0;">
                          <strong>📅 Importante:</strong> Após 5 dias sem pagamento, sua conta será cancelada automaticamente.
                      </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                  
                  <p style="color: #6c757d; font-size: 14px; text-align: center;">
                      Precisa de ajuda? Responda este email ou entre em contato:<br>
                      📧 suporte@jusgestao.com.br<br>
                      🌐 ${baseUrl}
                  </p>
              </div>
          </body>
          </html>
        `;
        break;

      case "assinatura_reativada":
        subject = "🎉 Bem-vindo de volta ao JusGestão!";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <title>Conta Reativada - JusGestão</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #16a34a, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">🎉 Conta Reativada!</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">JusGestão - Sistema para Advogados</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Olá <strong>${nome}</strong>,</p>
                  
                  <p>Sua conta JusGestão foi reativada com sucesso! 🎉</p>
                  
                  <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="color: #0c5460; margin-top: 0;">✅ Tudo Pronto:</h3>
                      <ul style="color: #0c5460; margin: 0;">
                          <li>Todos os seus dados foram restaurados</li>
                          <li>Processos, clientes e documentos intactos</li>
                          <li>Assinatura ativa por mais 30 dias</li>
                          <li>Acesso completo liberado</li>
                      </ul>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${baseUrl}/dashboard" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                          🚀 Acessar Dashboard
                      </a>
                  </div>
                  
                  <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p style="color: #155724; margin: 0;">
                          <strong>💡 Dica:</strong> Para evitar problemas futuros, verifique se seus dados de pagamento estão atualizados.
                      </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                  
                  <p style="color: #6c757d; font-size: 14px; text-align: center;">
                      Obrigado por confiar no JusGestão!<br>
                      📧 suporte@jusgestao.com.br<br>
                      🌐 ${baseUrl}
                  </p>
              </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error("Tipo de email não reconhecido");
    }

    // Enviar email usando fetch para a API do Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "JusGestão <noreply@jusgestao.com.br>",
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro ao enviar email: ${errorData}`);
    }

    const result = await response.json();
    console.log("✅ Email enviado com sucesso:", result);

    return new Response(JSON.stringify({
      success: true,
      message: "Email enviado com sucesso",
      email_id: result.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Erro interno do servidor"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
