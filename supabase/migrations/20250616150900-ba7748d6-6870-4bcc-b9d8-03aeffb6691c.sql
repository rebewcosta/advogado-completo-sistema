
-- Tabela para armazenar os avisos administrativos
CREATE TABLE public.avisos_administrativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  prioridade TEXT NOT NULL DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'critica'
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE NULL, -- NULL = sem data de expiração
  criado_por UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para controlar quais usuários já viram cada aviso
CREATE TABLE public.avisos_lidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aviso_id UUID REFERENCES public.avisos_administrativos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  lido_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aviso_id, user_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.avisos_administrativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos_lidos ENABLE ROW LEVEL SECURITY;

-- Políticas para avisos_administrativos
-- Todos podem ver avisos ativos
CREATE POLICY "Todos podem ver avisos ativos" 
  ON public.avisos_administrativos 
  FOR SELECT 
  USING (ativo = true AND (data_fim IS NULL OR data_fim > now()));

-- Apenas admins podem criar/editar avisos
CREATE POLICY "Apenas admins podem gerenciar avisos" 
  ON public.avisos_administrativos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Políticas para avisos_lidos
-- Usuários podem ver apenas seus próprios registros de leitura
CREATE POLICY "Usuários podem ver seus próprios avisos lidos" 
  ON public.avisos_lidos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem marcar avisos como lidos
CREATE POLICY "Usuários podem marcar avisos como lidos" 
  ON public.avisos_lidos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Função para buscar avisos não lidos de um usuário
CREATE OR REPLACE FUNCTION public.get_avisos_nao_lidos(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  titulo text,
  mensagem text,
  tipo text,
  prioridade text,
  data_inicio timestamp with time zone,
  data_fim timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.titulo,
    a.mensagem,
    a.tipo,
    a.prioridade,
    a.data_inicio,
    a.data_fim
  FROM public.avisos_administrativos a
  WHERE a.ativo = true 
    AND (a.data_fim IS NULL OR a.data_fim > now())
    AND NOT EXISTS (
      SELECT 1 FROM public.avisos_lidos al 
      WHERE al.aviso_id = a.id AND al.user_id = p_user_id
    )
  ORDER BY 
    CASE a.prioridade
      WHEN 'critica' THEN 1
      WHEN 'alta' THEN 2
      WHEN 'normal' THEN 3
      WHEN 'baixa' THEN 4
    END,
    a.created_at DESC;
END;
$function$;

-- Habilitar realtime para as tabelas
ALTER TABLE public.avisos_administrativos REPLICA IDENTITY FULL;
ALTER TABLE public.avisos_lidos REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação do realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.avisos_administrativos, public.avisos_lidos;
