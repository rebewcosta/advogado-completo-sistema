
-- Criar tabela para configurações de monitoramento de prazos
CREATE TABLE public.prazo_configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  dias_alerta_critico INTEGER NOT NULL DEFAULT 3,
  dias_alerta_urgente INTEGER NOT NULL DEFAULT 7,
  dias_alerta_medio INTEGER NOT NULL DEFAULT 15,
  notificacoes_email BOOLEAN NOT NULL DEFAULT true,
  notificacoes_sistema BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de alertas enviados
CREATE TABLE public.prazo_alertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
  evento_agenda_id UUID REFERENCES public.agenda_eventos(id) ON DELETE CASCADE,
  tipo_prazo TEXT NOT NULL CHECK (tipo_prazo IN ('processo', 'evento_agenda')),
  tipo_alerta TEXT NOT NULL CHECK (tipo_alerta IN ('critico', 'urgente', 'medio')),
  data_prazo DATE NOT NULL,
  dias_restantes INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  alerta_enviado BOOLEAN NOT NULL DEFAULT false,
  data_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cálculos de prazos processuais
CREATE TABLE public.prazo_calculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome_calculo TEXT NOT NULL,
  tipo_prazo TEXT NOT NULL, -- 'recurso', 'contestacao', 'embargos', etc
  dias_prazo INTEGER NOT NULL,
  considera_feriados BOOLEAN NOT NULL DEFAULT true,
  considera_fins_semana BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão de prazos processuais
INSERT INTO public.prazo_calculos (user_id, nome_calculo, tipo_prazo, dias_prazo, observacoes) 
SELECT 
  auth.uid(),
  'Recurso de Apelação',
  'recurso',
  15,
  'Prazo para interposição de recurso de apelação'
WHERE auth.uid() IS NOT NULL
UNION ALL
SELECT 
  auth.uid(),
  'Contestação',
  'contestacao', 
  15,
  'Prazo para apresentação de contestação'
WHERE auth.uid() IS NOT NULL
UNION ALL
SELECT 
  auth.uid(),
  'Embargos de Declaração',
  'embargos',
  5,
  'Prazo para embargos de declaração'
WHERE auth.uid() IS NOT NULL
UNION ALL
SELECT 
  auth.uid(),
  'Recurso Especial/Extraordinário',
  'recurso',
  15,
  'Prazo para recursos aos tribunais superiores'
WHERE auth.uid() IS NOT NULL;

-- Habilitar RLS nas tabelas
ALTER TABLE public.prazo_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prazo_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prazo_calculos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prazo_configuracoes
CREATE POLICY "Users can view own prazo configurations" ON public.prazo_configuracoes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prazo configurations" ON public.prazo_configuracoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prazo configurations" ON public.prazo_configuracoes
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para prazo_alertas
CREATE POLICY "Users can view own prazo alerts" ON public.prazo_alertas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prazo alerts" ON public.prazo_alertas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prazo alerts" ON public.prazo_alertas
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para prazo_calculos
CREATE POLICY "Users can view own prazo calculations" ON public.prazo_calculos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prazo calculations" ON public.prazo_calculos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prazo calculations" ON public.prazo_calculos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prazo calculations" ON public.prazo_calculos
  FOR DELETE USING (auth.uid() = user_id);

-- Função para calcular próximos prazos críticos
CREATE OR REPLACE FUNCTION public.get_prazos_criticos(p_user_id UUID, p_dias_limite INTEGER DEFAULT 30)
RETURNS TABLE(
  id UUID,
  tipo TEXT,
  titulo TEXT,
  data_prazo DATE,
  dias_restantes INTEGER,
  nivel_criticidade TEXT,
  detalhes JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Prazos de processos
  SELECT 
    p.id,
    'processo'::TEXT as tipo,
    ('Prazo: ' || p.numero_processo)::TEXT as titulo,
    p.proximo_prazo as data_prazo,
    (p.proximo_prazo - CURRENT_DATE)::INTEGER as dias_restantes,
    CASE 
      WHEN (p.proximo_prazo - CURRENT_DATE) <= 3 THEN 'critico'
      WHEN (p.proximo_prazo - CURRENT_DATE) <= 7 THEN 'urgente'
      WHEN (p.proximo_prazo - CURRENT_DATE) <= 15 THEN 'medio'
      ELSE 'normal'
    END as nivel_criticidade,
    jsonb_build_object(
      'numero_processo', p.numero_processo,
      'cliente', COALESCE(c.nome, p.nome_cliente_text),
      'tipo_processo', p.tipo_processo,
      'status', p.status_processo
    ) as detalhes
  FROM public.processos p
  LEFT JOIN public.clientes c ON c.id = p.cliente_id
  WHERE p.user_id = p_user_id 
    AND p.proximo_prazo IS NOT NULL 
    AND p.proximo_prazo >= CURRENT_DATE
    AND (p.proximo_prazo - CURRENT_DATE) <= p_dias_limite

  UNION ALL

  -- Prazos de eventos da agenda
  SELECT 
    ae.id,
    'evento'::TEXT as tipo,
    ae.titulo,
    ae.data_hora_inicio::DATE as data_prazo,
    (ae.data_hora_inicio::DATE - CURRENT_DATE)::INTEGER as dias_restantes,
    CASE 
      WHEN (ae.data_hora_inicio::DATE - CURRENT_DATE) <= 3 THEN 'critico'
      WHEN (ae.data_hora_inicio::DATE - CURRENT_DATE) <= 7 THEN 'urgente' 
      WHEN (ae.data_hora_inicio::DATE - CURRENT_DATE) <= 15 THEN 'medio'
      ELSE 'normal'
    END as nivel_criticidade,
    jsonb_build_object(
      'tipo_evento', ae.tipo_evento,
      'descricao', ae.descricao_evento,
      'local', ae.local_evento,
      'prioridade', ae.prioridade,
      'cliente', CASE WHEN c.nome IS NOT NULL THEN c.nome ELSE NULL END,
      'processo', CASE WHEN p.numero_processo IS NOT NULL THEN p.numero_processo ELSE NULL END
    ) as detalhes
  FROM public.agenda_eventos ae
  LEFT JOIN public.clientes c ON c.id = ae.cliente_associado_id
  LEFT JOIN public.processos p ON p.id = ae.processo_associado_id
  WHERE ae.user_id = p_user_id 
    AND ae.data_hora_inicio::DATE >= CURRENT_DATE
    AND (ae.data_hora_inicio::DATE - CURRENT_DATE) <= p_dias_limite
    AND ae.status_evento != 'Cancelado'

  ORDER BY data_prazo ASC, nivel_criticidade DESC;
END;
$$;

-- Função para gerar alertas automáticos
CREATE OR REPLACE FUNCTION public.gerar_alertas_prazos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_count INTEGER := 0;
  config_record RECORD;
  prazo_record RECORD;
BEGIN
  -- Para cada usuário com configurações ativas
  FOR config_record IN 
    SELECT * FROM public.prazo_configuracoes 
    WHERE notificacoes_sistema = true
  LOOP
    -- Buscar prazos críticos para o usuário
    FOR prazo_record IN 
      SELECT * FROM public.get_prazos_criticos(config_record.user_id, 30)
      WHERE (
        (nivel_criticidade = 'critico' AND dias_restantes <= config_record.dias_alerta_critico) OR
        (nivel_criticidade = 'urgente' AND dias_restantes <= config_record.dias_alerta_urgente) OR  
        (nivel_criticidade = 'medio' AND dias_restantes <= config_record.dias_alerta_medio)
      )
    LOOP
      -- Verificar se já existe alerta para este prazo
      IF NOT EXISTS (
        SELECT 1 FROM public.prazo_alertas 
        WHERE user_id = config_record.user_id 
          AND ((tipo_prazo = 'processo' AND processo_id = prazo_record.id) OR
               (tipo_prazo = 'evento_agenda' AND evento_agenda_id = prazo_record.id))
          AND data_prazo = prazo_record.data_prazo
          AND alerta_enviado = true
      ) THEN
        -- Criar novo alerta
        INSERT INTO public.prazo_alertas (
          user_id, 
          processo_id,
          evento_agenda_id,
          tipo_prazo,
          tipo_alerta,
          data_prazo,
          dias_restantes,
          titulo,
          descricao,
          alerta_enviado
        ) VALUES (
          config_record.user_id,
          CASE WHEN prazo_record.tipo = 'processo' THEN prazo_record.id ELSE NULL END,
          CASE WHEN prazo_record.tipo = 'evento' THEN prazo_record.id ELSE NULL END,
          prazo_record.tipo,
          prazo_record.nivel_criticidade,
          prazo_record.data_prazo,
          prazo_record.dias_restantes,
          prazo_record.titulo,
          'Alerta automático: ' || prazo_record.titulo || ' vence em ' || prazo_record.dias_restantes || ' dias',
          false
        );
        
        alert_count := alert_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN alert_count;
END;
$$;
