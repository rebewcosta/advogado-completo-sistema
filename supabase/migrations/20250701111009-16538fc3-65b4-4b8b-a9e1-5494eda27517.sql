
-- Criar função RPC para verificar status de assinatura (usada pelo componente GerenciarAssinatura)
CREATE OR REPLACE FUNCTION public.verificar_status_assinatura(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    v_user_email text;
    v_user_metadata jsonb;
    v_subscription_status text;
    v_current_period_end_timestamp timestamptz;
    v_current_period_end_text text;
    v_account_type text;
    v_message text;
BEGIN
    -- Obter metadados e email do usuário do esquema 'auth'
    SELECT email, raw_user_meta_data INTO v_user_email, v_user_metadata
    FROM auth.users
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'status', 'inativa',
            'proximo_faturamento', NULL,
            'account_type', 'none',
            'message', 'Usuário não encontrado.'
        );
    END IF;

    -- 1. Verificar se é o administrador master
    IF v_user_email = 'webercostag@gmail.com' THEN
        v_account_type := 'admin';
        v_subscription_status := 'admin';
        v_message := 'Acesso total de Administrador.';
        v_current_period_end_text := NULL;

    -- 2. Verificar se é "Assinatura Amiga" (acesso especial)
    ELSIF (v_user_metadata->>'special_access')::boolean IS TRUE THEN
        v_account_type := 'amigo';
        v_subscription_status := 'amigo';
        v_message := 'Acesso de cortesia vitalício (Assinatura Amiga).';
        v_current_period_end_text := NULL;

    -- 3. Verificar assinatura do Stripe nos metadados do usuário
    ELSE
        v_subscription_status := v_user_metadata->>'subscription_status';
        
        IF v_user_metadata->>'current_period_end' IS NOT NULL THEN
            BEGIN
                -- Tenta converter o 'current_period_end', que pode ser um timestamp epoch ou uma string ISO
                IF v_user_metadata->>'current_period_end' ~ '^\d+$' THEN -- Verifica se é um número (epoch)
                    v_current_period_end_timestamp := to_timestamp((v_user_metadata->>'current_period_end')::numeric);
                ELSE -- Senão, assume que é uma string de data (ISO 8601)
                    v_current_period_end_timestamp := (v_user_metadata->>'current_period_end')::timestamptz;
                END IF;
                v_current_period_end_text := to_char(v_current_period_end_timestamp, 'DD/MM/YYYY');
            EXCEPTION WHEN others THEN
                -- Em caso de falha na conversão, define como nulo para evitar erros.
                v_current_period_end_text := NULL;
                RAISE WARNING 'Falha ao converter current_period_end para o usuário %: %', p_user_id, v_user_metadata->>'current_period_end';
            END;
        ELSE
            v_current_period_end_text := NULL;
        END IF;

        -- Define o tipo de conta e a mensagem com base no status da assinatura
        IF v_subscription_status = 'active' OR v_subscription_status = 'trialing' THEN
            v_account_type := 'premium';
            v_message := 'Assinatura Premium ativa.';
        ELSIF v_subscription_status = 'past_due' OR v_subscription_status = 'incomplete' THEN
            v_account_type := 'pendente';
            v_subscription_status := 'pendente'; -- Normaliza o status para o front-end
            v_message := 'Pagamento da assinatura pendente.';
        ELSE
            v_account_type := 'none';
            v_subscription_status := 'inativa';
            v_message := 'Nenhuma assinatura ativa encontrada.';
        END IF;
    END IF;

    -- Retorna o objeto JSON final para a aplicação cliente
    RETURN json_build_object(
        'status', COALESCE(v_subscription_status, 'inativa'),
        'proximo_faturamento', v_current_period_end_text,
        'account_type', v_account_type,
        'message', v_message
    );
END;
$$;

-- Habilitar realtime para a tabela profiles (se necessário)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
