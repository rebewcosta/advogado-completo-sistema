
-- Fix 1: Remove hardcoded service role key from the database function
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
    -- Note: The service role key should now be handled securely in the edge function environment
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

-- Fix 2: Replace overly permissive logs policy with secure service-role policy
DROP POLICY IF EXISTS "System can create logs" ON public.logs_monitoramento;

CREATE POLICY "Service can create logs" 
  ON public.logs_monitoramento 
  FOR INSERT 
  WITH CHECK (
    -- Only allow inserts from authenticated users or service role
    auth.uid() IS NOT NULL OR 
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Fix 3: Add missing RLS policies for better security
CREATE POLICY "Users can update their own monitoring logs" 
  ON public.logs_monitoramento 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Fix 4: Secure the fontes_diarios table (only service role should modify)
ALTER TABLE public.fontes_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sources" 
  ON public.fontes_diarios 
  FOR SELECT 
  USING (ativo = true);

CREATE POLICY "Service role can manage sources" 
  ON public.fontes_diarios 
  FOR ALL 
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Fix 5: Create user roles table for proper role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'moderator');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create another function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin role for the master admin email
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT id, 'admin', id
FROM auth.users 
WHERE email = 'webercostag@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
