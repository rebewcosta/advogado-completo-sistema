-- Nenhuma alteração na estrutura do banco de dados é necessária para a integração com Escavador
-- A tabela 'processos' já possui todos os campos necessários:
-- - numero_processo
-- - tipo_processo  
-- - status_processo
-- - vara_tribunal
-- - proximo_prazo
-- - cliente_id
-- - nome_cliente_text
-- - user_id

-- Apenas vamos criar uma função para validar se a OAB existe no perfil do usuário
CREATE OR REPLACE FUNCTION public.get_user_oab(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_oab text;
BEGIN
  -- Busca a OAB do usuário na tabela user_profiles
  SELECT oab INTO user_oab
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  RETURN user_oab;
END;
$$;