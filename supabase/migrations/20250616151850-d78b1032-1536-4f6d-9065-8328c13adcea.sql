
-- Criar bucket para logos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket de logos
-- Permitir que usuários autenticados façam upload de logos
CREATE POLICY "Usuários podem fazer upload de logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'public'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir que usuários vejam logos públicos
CREATE POLICY "Logos são publicamente visíveis" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

-- Permitir que usuários deletem suas próprias logos
CREATE POLICY "Usuários podem deletar suas próprias logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'public'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir que usuários atualizem suas próprias logos
CREATE POLICY "Usuários podem atualizar suas próprias logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'logos' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = 'public'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
