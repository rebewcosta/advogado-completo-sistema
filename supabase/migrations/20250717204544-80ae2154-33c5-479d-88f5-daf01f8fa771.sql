-- Corrigir status da assinatura da michelysaraiva.adv@gmail.com para trial
UPDATE profiles 
SET 
  subscription_status = 'trial',
  subscription_data = jsonb_build_object(
    'trial_start', '2025-07-17T20:12:11.452935+00'::timestamp,
    'trial_end', ('2025-07-17T20:12:11.452935+00'::timestamp + interval '7 days'),
    'status', 'trial'
  ),
  updated_at = now()
WHERE id = '9f5218fc-c4c6-4f41-a1db-872a289b74c1';

-- Verificar o resultado
SELECT 
  p.id,
  p.subscription_status,
  p.subscription_data,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'michelysaraiva.adv@gmail.com';