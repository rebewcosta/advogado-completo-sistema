
-- Criar tabela para logs de erros do sistema
CREATE TABLE public.system_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  component_name TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT DEFAULT 'error' CHECK (severity IN ('error', 'warning', 'info')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.system_error_logs ENABLE ROW LEVEL SECURITY;

-- Política para que apenas admins possam ver todos os logs
CREATE POLICY "Admins can view all error logs"
  ON public.system_error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que usuários possam inserir seus próprios logs de erro
CREATE POLICY "Users can insert their own error logs"
  ON public.system_error_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Política para que admins possam atualizar logs (marcar como resolvidos)
CREATE POLICY "Admins can update error logs"
  ON public.system_error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Criar tabela para armazenar informações de perfil dos usuários (nomes, etc)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT,
  email TEXT,
  telefone TEXT,
  oab TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários possam ver e editar seus próprios perfis
CREATE POLICY "Users can manage their own profiles"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para que admins possam ver todos os perfis
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger para atualizar automaticamente o updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Função para atualizar status online do usuário
CREATE OR REPLACE FUNCTION update_user_online_status(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_profiles (id, last_seen, is_online)
  VALUES (user_uuid, NOW(), TRUE)
  ON CONFLICT (id) 
  DO UPDATE SET 
    last_seen = NOW(),
    is_online = TRUE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar usuário como offline (pode ser chamada por um cron job)
CREATE OR REPLACE FUNCTION mark_users_offline()
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles 
  SET is_online = FALSE, updated_at = NOW()
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
