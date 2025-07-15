-- Permite que CPF/CNPJ e telefone sejam opcionais
-- Mantém apenas o nome como obrigatório

-- Permitir que cpfCnpj seja null (mas manter unique quando não for null)
ALTER TABLE public.clientes 
ALTER COLUMN cpfCnpj DROP NOT NULL;

-- Permitir que telefone seja null
ALTER TABLE public.clientes 
ALTER COLUMN telefone DROP NOT NULL;

-- Atualizar registros existentes que possam ter valores vazios
UPDATE public.clientes 
SET cpfCnpj = NULL 
WHERE cpfCnpj = '';

UPDATE public.clientes 
SET telefone = NULL 
WHERE telefone = '';

-- Garantir que a unique constraint do CPF/CNPJ ainda funcione
-- (PostgreSQL automaticamente ignora valores NULL em unique constraints)