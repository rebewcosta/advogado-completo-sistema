
-- Criar tabela para armazenar processos favoritos do usuário
CREATE TABLE public.processos_favoritos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  numero_processo TEXT NOT NULL,
  nome_processo TEXT,
  tribunal TEXT,
  data_ultima_movimentacao DATE,
  status_processo TEXT,
  favorito_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, numero_processo)
);

-- Criar tabela para cache de consultas de processos
CREATE TABLE public.processos_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL UNIQUE,
  dados_processo JSONB NOT NULL,
  tribunal TEXT,
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Criar tabela para histórico de consultas do usuário
CREATE TABLE public.historico_consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tipo_consulta TEXT NOT NULL, -- 'numero', 'nome', 'documento'
  termo_busca TEXT NOT NULL,
  tribunal TEXT,
  resultados_encontrados INTEGER DEFAULT 0,
  consultado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para processos_favoritos
ALTER TABLE public.processos_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorite processes" 
  ON public.processos_favoritos 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorite processes" 
  ON public.processos_favoritos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite processes" 
  ON public.processos_favoritos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite processes" 
  ON public.processos_favoritos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar RLS para histórico_consultas
ALTER TABLE public.historico_consultas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own query history" 
  ON public.historico_consultas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own query history" 
  ON public.historico_consultas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- O cache de processos será público para otimização (sem RLS)
ALTER TABLE public.processos_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read process cache" 
  ON public.processos_cache 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert into process cache" 
  ON public.processos_cache 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update process cache" 
  ON public.processos_cache 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Criar índices para performance
CREATE INDEX idx_processos_favoritos_user_id ON public.processos_favoritos(user_id);
CREATE INDEX idx_processos_favoritos_numero ON public.processos_favoritos(numero_processo);
CREATE INDEX idx_processos_cache_numero ON public.processos_cache(numero_processo);
CREATE INDEX idx_processos_cache_expiracao ON public.processos_cache(data_expiracao);
CREATE INDEX idx_historico_consultas_user_id ON public.historico_consultas(user_id);
