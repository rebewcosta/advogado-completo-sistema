
-- Function to verify subscription status for a user
CREATE OR REPLACE FUNCTION public.verificar_status_assinatura(uid uuid)
RETURNS json
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT json_build_object(
    'status', COALESCE(p.subscription_status, 'inativa'),
    'proximo_faturamento', 
      CASE 
        WHEN p.subscription_data IS NOT NULL AND p.subscription_data::json->>'current_period_end' IS NOT NULL
        THEN to_char(to_timestamp((p.subscription_data::json->>'current_period_end')::numeric), 'DD/MM/YYYY')
        ELSE NULL
      END
  )
  FROM auth.users u
  LEFT JOIN (
    -- This is a placeholder - in a real implementation, you would link to an actual profiles or subscriptions table
    SELECT id, 'inativa' as subscription_status, NULL as subscription_data
    FROM auth.users
    LIMIT 0
  ) p ON p.id = u.id
  WHERE u.id = uid;
$$;

COMMENT ON FUNCTION public.verificar_status_assinatura IS 'Function to check user subscription status';
