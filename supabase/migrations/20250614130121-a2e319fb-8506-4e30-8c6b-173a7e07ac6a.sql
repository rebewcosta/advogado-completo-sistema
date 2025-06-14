
-- Add the missing columns to the configuracoes_monitoramento table
ALTER TABLE public.configuracoes_monitoramento 
ADD COLUMN numeros_oab text[] DEFAULT '{}',
ADD COLUMN nomes_escritorio text[] DEFAULT '{}';
