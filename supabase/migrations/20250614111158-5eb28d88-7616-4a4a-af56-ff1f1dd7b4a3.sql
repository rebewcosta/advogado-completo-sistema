
-- Criar tabela para logs de monitoramento
CREATE TABLE public.logs_monitoramento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  data_execucao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'iniciado',
  publicacoes_encontradas INTEGER DEFAULT 0,
  erros TEXT,
  tempo_execucao_segundos INTEGER,
  fontes_consultadas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.logs_monitoramento ENABLE ROW LEVEL SECURITY;

-- Política para logs
CREATE POLICY "Users can view their own logs" 
  ON public.logs_monitoramento 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create logs" 
  ON public.logs_monitoramento 
  FOR INSERT 
  WITH CHECK (true);

-- Criar tabela para fontes de diários oficiais
CREATE TABLE public.fontes_diarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado VARCHAR(2) NOT NULL,
  url_base TEXT NOT NULL,
  tipo_fonte TEXT NOT NULL DEFAULT 'html', -- html, pdf, api
  seletor_css TEXT, -- para scraping HTML
  ativo BOOLEAN DEFAULT true,
  ultima_verificacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir algumas fontes iniciais
INSERT INTO public.fontes_diarios (nome, estado, url_base, tipo_fonte, seletor_css) VALUES
('Diário da Justiça - SP', 'SP', 'https://www.djsp.jus.br/', 'html', '.publicacao'),
('Diário Oficial - RJ', 'RJ', 'https://www.ioerj.com.br/', 'html', '.materia'),
('Diário da Justiça - MG', 'MG', 'https://www.tjmg.jus.br/portal-tjmg/jurisprudencia/diario-da-justica/', 'html', '.item-diario'),
('Diário da Justiça - RS', 'RS', 'https://www.tjrs.jus.br/site/imprensa/diario_da_justica/', 'html', '.noticia');

-- Habilitar extensões para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função para executar monitoramento automático
CREATE OR REPLACE FUNCTION public.executar_monitoramento_automatico()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config_record RECORD;
BEGIN
  -- Buscar todas as configurações ativas
  FOR config_record IN 
    SELECT user_id, nomes_monitoramento, estados_monitoramento, palavras_chave
    FROM public.configuracoes_monitoramento 
    WHERE monitoramento_ativo = true
  LOOP
    -- Fazer chamada para a edge function de monitoramento
    PERFORM net.http_post(
      url := 'https://lqprcsquknlegzmzdoct.supabase.co/functions/v1/monitorar-publicacoes',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHJjc3F1a25sZWd6bXpkb2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzA4NjAsImV4cCI6MjA2Mjg0Njg2MH0.7L4U-NZvY_WzQy6svqL7xzSUdGVvQ0IkYd-L6PhdYJs"}'::jsonb,
      body := json_build_object(
        'user_id', config_record.user_id,
        'nomes', config_record.nomes_monitoramento,
        'estados', config_record.estados_monitoramento,
        'palavras_chave', config_record.palavras_chave
      )::jsonb
    );
  END LOOP;
END;
$$;

-- Agendar execução automática a cada 6 horas
SELECT cron.schedule(
  'monitoramento-publicacoes',
  '0 */6 * * *', -- A cada 6 horas
  $$SELECT public.executar_monitoramento_automatico();$$
);
