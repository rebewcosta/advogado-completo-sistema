
-- Alterar a tabela equipe_membros para permitir email nulo
ALTER TABLE public.equipe_membros ALTER COLUMN email DROP NOT NULL;
