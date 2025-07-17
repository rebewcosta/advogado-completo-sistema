-- Ativar proteção contra senhas vazadas no Supabase Auth
-- Esta configuração ativa a proteção contra senhas conhecidas como comprometidas
-- Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

-- Configurar política de senhas mais robusta
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Nota: A proteção contra senhas vazadas deve ser ativada através do painel administrativo do Supabase
-- em Authentication > Settings > Password Settings > Enable Leaked Password Protection
-- Esta migração documenta a necessidade dessa configuração