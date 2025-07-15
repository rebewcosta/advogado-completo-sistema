-- Ativar realtime para a tabela user_profiles
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;

-- Criar função para marcar usuários como offline automaticamente
CREATE OR REPLACE FUNCTION public.mark_users_offline_after_timeout()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Marcar usuários como offline se não há atividade por mais de 5 minutos
  UPDATE public.user_profiles 
  SET 
    is_online = false, 
    updated_at = NOW()
  WHERE 
    is_online = true 
    AND last_seen < NOW() - INTERVAL '5 minutes';
    
  -- Log da operação
  RAISE NOTICE 'Usuários marcados como offline após 5 minutos de inatividade';
END;
$$;

-- Criar uma função para atualizar automaticamente last_seen quando há atividade
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se is_online está sendo definido como true, atualizar last_seen
  IF NEW.is_online = true THEN
    NEW.last_seen = NOW();
  END IF;
  
  -- Sempre atualizar updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar last_seen automaticamente
DROP TRIGGER IF EXISTS update_user_last_seen_trigger ON public.user_profiles;
CREATE TRIGGER update_user_last_seen_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_last_seen();

-- Comentário sobre como executar periodicamente (deve ser configurado externamente)
COMMENT ON FUNCTION public.mark_users_offline_after_timeout() IS 
'Esta função deve ser executada periodicamente (ex: a cada 1 minuto) via cron job ou edge function para marcar usuários como offline após 5 minutos de inatividade.';