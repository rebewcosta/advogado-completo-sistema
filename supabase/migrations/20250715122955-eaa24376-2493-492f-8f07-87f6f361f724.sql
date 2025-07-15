-- Corrigir funções com problemas de search_path para segurança

-- Corrigir função update_user_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Corrigir função update_user_online_status
CREATE OR REPLACE FUNCTION public.update_user_online_status(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, last_seen, is_online)
  VALUES (user_uuid, NOW(), TRUE)
  ON CONFLICT (id) 
  DO UPDATE SET 
    last_seen = NOW(),
    is_online = TRUE,
    updated_at = NOW();
END;
$$;

-- Corrigir função mark_users_offline
CREATE OR REPLACE FUNCTION public.mark_users_offline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_profiles 
  SET is_online = FALSE, updated_at = NOW()
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$;

-- Corrigir função executar_monitoramento_automatico
CREATE OR REPLACE FUNCTION public.executar_monitoramento_automatico()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'user_id', config_record.user_id,
        'nomes', config_record.nomes_monitoramento,
        'estados', config_record.estados_monitoramento,
        'palavras_chave', config_record.palavras_chave,
        'source', 'cron'
      )::jsonb
    );
  END LOOP;
END;
$$;

-- Corrigir função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Corrigir função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1;
$$;

-- Corrigir função sanitize_text_input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove caracteres perigosos e normaliza o texto
  RETURN trim(regexp_replace(
    regexp_replace(input_text, '[<>"\''&]', '', 'g'),
    '\s+', ' ', 'g'
  ));
END;
$$;