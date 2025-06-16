
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, redirectTo } = await req.json()

    if (!email) {
      throw new Error('Email é obrigatório')
    }

    // Template de email customizado com botão azul e texto branco
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0; font-size: 24px;">Redefinir Senha</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha:
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background-color: #3b82f6; 
                        color: white !important; 
                        text-decoration: none; 
                        padding: 12px 30px; 
                        border-radius: 6px; 
                        display: inline-block; 
                        font-weight: 600;
                        border: none;">
                Redefinir Senha
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0;">
                Se você não solicitou a redefinição de senha, ignore este email. 
                Este link expira em 1 hora por motivos de segurança.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${Deno.env.get('SITE_URL')}/atualizar-senha`,
      data: {
        email_template: emailTemplate
      }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de recuperação enviado com sucesso' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
