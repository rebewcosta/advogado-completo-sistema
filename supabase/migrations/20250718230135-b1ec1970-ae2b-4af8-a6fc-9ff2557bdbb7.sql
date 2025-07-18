-- Criar tabela para movimentações processuais
CREATE TABLE public.processo_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  processo_id UUID,
  numero_processo TEXT NOT NULL,
  data_movimentacao DATE,
  tipo_movimentacao TEXT,
  descricao_movimentacao TEXT,
  orgao TEXT,
  magistrado TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para partes do processo
CREATE TABLE public.processo_partes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  processo_id UUID,
  numero_processo TEXT NOT NULL,
  nome_parte TEXT NOT NULL,
  tipo_parte TEXT, -- 'Polo Ativo', 'Polo Passivo', 'Terceiro Interessado'
  documento TEXT, -- CPF/CNPJ se disponível
  qualificacao TEXT, -- Autor, Réu, Advogado, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para informações financeiras dos processos
CREATE TABLE public.processo_financeiro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  processo_id UUID,
  numero_processo TEXT NOT NULL,
  valor_causa DECIMAL(15,2),
  moeda TEXT DEFAULT 'BRL',
  honorarios_contratuais DECIMAL(15,2),
  honorarios_sucumbenciais DECIMAL(15,2),
  custas_processuais DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos extras à tabela processos para dados do Escavador
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS assunto_processo TEXT,
ADD COLUMN IF NOT EXISTS classe_judicial TEXT,
ADD COLUMN IF NOT EXISTS instancia TEXT,
ADD COLUMN IF NOT EXISTS data_distribuicao DATE,
ADD COLUMN IF NOT EXISTS segredo_justica BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS valor_causa DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS situacao_processo TEXT,
ADD COLUMN IF NOT EXISTS origem_dados TEXT DEFAULT 'Manual',
ADD COLUMN IF NOT EXISTS escavador_id TEXT,
ADD COLUMN IF NOT EXISTS ultima_atualizacao_escavador TIMESTAMP WITH TIME ZONE;

-- Enable RLS nas novas tabelas
ALTER TABLE public.processo_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processo_partes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processo_financeiro ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para movimentações
CREATE POLICY "Usuários podem ver suas próprias movimentações" 
ON public.processo_movimentacoes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias movimentações" 
ON public.processo_movimentacoes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias movimentações" 
ON public.processo_movimentacoes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias movimentações" 
ON public.processo_movimentacoes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para partes
CREATE POLICY "Usuários podem ver suas próprias partes de processo" 
ON public.processo_partes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias partes de processo" 
ON public.processo_partes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias partes de processo" 
ON public.processo_partes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias partes de processo" 
ON public.processo_partes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar políticas RLS para informações financeiras
CREATE POLICY "Usuários podem ver suas próprias informações financeiras" 
ON public.processo_financeiro 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias informações financeiras" 
ON public.processo_financeiro 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias informações financeiras" 
ON public.processo_financeiro 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias informações financeiras" 
ON public.processo_financeiro 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_processo_movimentacoes_user_id ON public.processo_movimentacoes(user_id);
CREATE INDEX idx_processo_movimentacoes_numero ON public.processo_movimentacoes(numero_processo);
CREATE INDEX idx_processo_partes_user_id ON public.processo_partes(user_id);
CREATE INDEX idx_processo_partes_numero ON public.processo_partes(numero_processo);
CREATE INDEX idx_processo_financeiro_user_id ON public.processo_financeiro(user_id);
CREATE INDEX idx_processo_financeiro_numero ON public.processo_financeiro(numero_processo);

-- Trigger para updated_at
CREATE TRIGGER update_processo_movimentacoes_updated_at
BEFORE UPDATE ON public.processo_movimentacoes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_processo_partes_updated_at
BEFORE UPDATE ON public.processo_partes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_processo_financeiro_updated_at
BEFORE UPDATE ON public.processo_financeiro
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();