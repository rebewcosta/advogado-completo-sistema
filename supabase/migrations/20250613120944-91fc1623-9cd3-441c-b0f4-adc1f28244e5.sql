
-- Criar tabela para armazenar publicações encontradas
CREATE TABLE public.publicacoes_diario_oficial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome_advogado TEXT NOT NULL,
  titulo_publicacao TEXT NOT NULL,
  conteudo_publicacao TEXT NOT NULL,
  data_publicacao DATE NOT NULL,
  diario_oficial TEXT NOT NULL, -- Ex: "Diário da Justiça - SP", "Diário Oficial - RJ"
  estado VARCHAR(2) NOT NULL, -- UF do estado
  comarca TEXT,
  numero_processo TEXT,
  tipo_publicacao TEXT, -- Ex: "Citação", "Intimação", "Sentença", "Despacho"
  url_publicacao TEXT, -- Link para a publicação original se disponível
  segredo_justica BOOLEAN DEFAULT FALSE,
  lida BOOLEAN DEFAULT FALSE, -- Se o advogado já visualizou
  importante BOOLEAN DEFAULT FALSE, -- Se marcou como importante
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_publicacoes_user_id ON public.publicacoes_diario_oficial(user_id);
CREATE INDEX idx_publicacoes_data ON public.publicacoes_diario_oficial(data_publicacao DESC);
CREATE INDEX idx_publicacoes_lida ON public.publicacoes_diario_oficial(user_id, lida);
CREATE INDEX idx_publicacoes_estado ON public.publicacoes_diario_oficial(estado);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.publicacoes_diario_oficial ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias publicações
CREATE POLICY "Users can view their own publicacoes" 
  ON public.publicacoes_diario_oficial 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para inserir publicações
CREATE POLICY "Users can create their own publicacoes" 
  ON public.publicacoes_diario_oficial 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar publicações
CREATE POLICY "Users can update their own publicacoes" 
  ON public.publicacoes_diario_oficial 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para excluir publicações
CREATE POLICY "Users can delete their own publicacoes" 
  ON public.publicacoes_diario_oficial 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_updated_at_publicacoes BEFORE UPDATE ON public.publicacoes_diario_oficial
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Criar tabela para configurações de monitoramento
CREATE TABLE public.configuracoes_monitoramento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  nomes_monitoramento TEXT[] NOT NULL DEFAULT '{}', -- Array com nomes/variações do advogado
  estados_monitoramento TEXT[] DEFAULT '{}', -- Estados específicos para monitorar (vazio = todos)
  palavras_chave TEXT[] DEFAULT '{}', -- Palavras-chave adicionais
  monitoramento_ativo BOOLEAN DEFAULT TRUE,
  ultima_busca TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para configurações
ALTER TABLE public.configuracoes_monitoramento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own monitoring settings" 
  ON public.configuracoes_monitoramento 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER handle_updated_at_configuracoes BEFORE UPDATE ON public.configuracoes_monitoramento
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
