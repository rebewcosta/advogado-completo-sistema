
-- Habilitar extensões necessárias para CRON jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar CRON job para executar verificação de inadimplência diariamente às 09:00
SELECT cron.schedule(
  'gerenciar-inadimplencia-diaria',
  '0 9 * * *', -- Todo dia às 09:00
  $$
  SELECT
    net.http_post(
        url:='https://lqprcsquknlegzmzdoct.supabase.co/functions/v1/gerenciar-inadimplencia',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHJjc3F1a25sZWd6bXpkb2N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI3MDg2MCwiZXhwIjoyMDYyODQ2ODYwfQ.k8_PzsVrww7lJPQ4_I7FcxfL6DGGzqqz5lV3C0vNpfk"}'::jsonb,
        body:='{"source": "cron_job"}'::jsonb
    ) as request_id;
  $$
);

-- Verificar se o job foi criado corretamente
SELECT * FROM cron.job WHERE jobname = 'gerenciar-inadimplencia-diaria';

-- Criar função para validação de dados de entrada mais robusta
CREATE OR REPLACE FUNCTION public.validate_user_input(
  input_data jsonb,
  required_fields text[],
  max_lengths jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  field text;
  errors text[] := '{}';
  result jsonb;
BEGIN
  -- Verificar campos obrigatórios
  FOREACH field IN ARRAY required_fields
  LOOP
    IF NOT (input_data ? field) OR (input_data ->> field) IS NULL OR trim(input_data ->> field) = '' THEN
      errors := array_append(errors, 'Campo obrigatório: ' || field);
    END IF;
  END LOOP;

  -- Verificar comprimento máximo dos campos
  FOR field IN SELECT jsonb_object_keys(max_lengths)
  LOOP
    IF (input_data ? field) AND length(input_data ->> field) > (max_lengths ->> field)::integer THEN
      errors := array_append(errors, 'Campo ' || field || ' excede o limite de ' || (max_lengths ->> field) || ' caracteres');
    END IF;
  END LOOP;

  -- Construir resultado
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object(
      'valid', false,
      'errors', to_jsonb(errors)
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'errors', '[]'::jsonb
    );
  END IF;

  RETURN result;
END;
$$;

-- Criar função para sanitização de dados
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove caracteres perigosos e normaliza o texto
  RETURN trim(regexp_replace(
    regexp_replace(input_text, '[<>"\''&]', '', 'g'),
    '\s+', ' ', 'g'
  ));
END;
$$;

-- Criar índices compostos para melhorar performance
CREATE INDEX IF NOT EXISTS idx_processos_user_status ON processos(user_id, status_processo);
CREATE INDEX IF NOT EXISTS idx_clientes_user_status ON clientes(user_id, status_cliente);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_user_data ON agenda_eventos(user_id, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_tarefas_user_status ON tarefas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_publicacoes_user_data ON publicacoes_diario_oficial(user_id, data_publicacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_user_data ON transacoes_financeiras(user_id, data_transacao);

-- Criar função para otimização de consultas pesadas
CREATE OR REPLACE FUNCTION public.get_user_dashboard_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Buscar dados do dashboard em uma única consulta otimizada
  WITH dashboard_stats AS (
    SELECT
      (SELECT COUNT(*) FROM processos WHERE user_id = p_user_id AND status_processo = 'Em andamento') as processos_ativos,
      (SELECT COUNT(*) FROM clientes WHERE user_id = p_user_id AND status_cliente = 'Ativo') as clientes_ativos,
      (SELECT COUNT(*) FROM tarefas WHERE user_id = p_user_id AND status = 'Pendente') as tarefas_pendentes,
      (SELECT COUNT(*) FROM agenda_eventos WHERE user_id = p_user_id AND data_hora_inicio::date >= CURRENT_DATE) as eventos_futuros,
      (SELECT COALESCE(SUM(valor), 0) FROM transacoes_financeiras WHERE user_id = p_user_id AND tipo_transacao = 'Receita' AND EXTRACT(MONTH FROM data_transacao) = EXTRACT(MONTH FROM CURRENT_DATE)) as receita_mes,
      (SELECT COUNT(*) FROM publicacoes_diario_oficial WHERE user_id = p_user_id AND lida = false) as publicacoes_nao_lidas
  )
  SELECT jsonb_build_object(
    'processos_ativos', processos_ativos,
    'clientes_ativos', clientes_ativos,
    'tarefas_pendentes', tarefas_pendentes,
    'eventos_futuros', eventos_futuros,
    'receita_mes', receita_mes,
    'publicacoes_nao_lidas', publicacoes_nao_lidas
  ) INTO result
  FROM dashboard_stats;

  RETURN result;
END;
$$;
