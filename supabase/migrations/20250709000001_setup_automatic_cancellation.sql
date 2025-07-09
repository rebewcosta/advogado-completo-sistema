
-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar cron job para executar verificação de inadimplência diariamente às 09:00
SELECT cron.schedule(
  'cancelar-assinaturas-inadimplentes',
  '0 9 * * *', -- Todo dia às 09:00
  $$
  SELECT
    net.http_post(
        url:='https://lqprcsquknlegzmzdoct.supabase.co/functions/v1/gerenciar-inadimplencia',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHJjc3F1a25sZWd6bXpkb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI3MDg2MCwiZXhwIjoyMDYyODQ2ODYwfQ.i-LuA4Oe_1oyCkHC0uZC_J7MuwS1-vDZLM4qJcHBdoE"}'::jsonb,
        body:='{"source": "cron", "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Criar tabela para logs de cancelamento automático
CREATE TABLE IF NOT EXISTS public.cancelamento_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  canceled_count INTEGER NOT NULL DEFAULT 0,
  details JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Habilitar RLS
ALTER TABLE public.cancelamento_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins verem os logs
CREATE POLICY "admin_view_cancellation_logs" ON public.cancelamento_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'webercostag@gmail.com'
  )
);
