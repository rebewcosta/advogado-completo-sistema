
-- Alterar a tabela clientes para permitir email nulo
ALTER TABLE public.clientes ALTER COLUMN email DROP NOT NULL;
