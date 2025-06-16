
-- Criar função para verificar senha atual do usuário
CREATE OR REPLACE FUNCTION public.verify_current_password(current_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  user_id uuid;
  stored_password_hash text;
BEGIN
  -- Obter o ID do usuário atual
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar o hash da senha armazenada
  SELECT encrypted_password INTO stored_password_hash
  FROM auth.users
  WHERE id = user_id;
  
  IF stored_password_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se a senha atual fornecida corresponde ao hash armazenado
  -- Usando a função de verificação de hash do Supabase
  RETURN crypt(current_password, stored_password_hash) = stored_password_hash;
END;
$$;
