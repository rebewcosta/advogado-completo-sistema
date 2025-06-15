
-- Verificar e corrigir a constraint da tabela prazo_alertas
-- O erro indica que o valor do tipo_prazo não está sendo aceito

-- Primeiro, vamos verificar os valores atuais que estão causando problema
-- e ajustar a constraint para aceitar os valores corretos

-- Remover a constraint existente que está causando problema
ALTER TABLE public.prazo_alertas DROP CONSTRAINT IF EXISTS prazo_alertas_tipo_prazo_check;

-- Recriar a constraint com os valores corretos
ALTER TABLE public.prazo_alertas ADD CONSTRAINT prazo_alertas_tipo_prazo_check 
CHECK (tipo_prazo IN ('processo', 'evento', 'evento_agenda'));

-- Verificar também a constraint do tipo_alerta
ALTER TABLE public.prazo_alertas DROP CONSTRAINT IF EXISTS prazo_alertas_tipo_alerta_check;

-- Recriar a constraint do tipo_alerta
ALTER TABLE public.prazo_alertas ADD CONSTRAINT prazo_alertas_tipo_alerta_check 
CHECK (tipo_alerta IN ('critico', 'urgente', 'medio'));
