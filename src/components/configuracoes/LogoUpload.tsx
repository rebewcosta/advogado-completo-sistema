
// src/components/configuracoes/LogoUpload.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LogoUploadProps {
  onUploadSuccess?: () => Promise<void>; // Adicionado callback
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, refreshSession, session } = useAuth();

  useEffect(() => {
    if (user?.user_metadata?.logo_url) {
      setCurrentLogoUrl(user.user_metadata.logo_url as string);
    } else {
      setCurrentLogoUrl(null); // Garante que se não houver logo, fique nulo
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    if (!user || !session) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para enviar uma logo. Tente fazer login novamente.",
        variant: "destructive"
      });
      return;
    }

    const file = e.target.files[0];

    if (file.size > 1024 * 1024) { // 1MB
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 1MB.",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos de imagem (JPG, PNG, GIF, WEBP).",
        variant: "destructive"
      });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      // Verificar se a sessão ainda é válida
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive"
        });
        setUploading(false);
        e.target.value = '';
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `public/${user.id}/logo-${Date.now()}.${fileExt}`;

      // Remover logo antiga se existir, para evitar acúmulo no storage
      if (user.user_metadata?.logo_path_storage) {
        await supabase.storage.from('logos').remove([user.user_metadata.logo_path_storage as string]);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // upsert false para garantir novo path e evitar cache
        });

      if (uploadError) throw new Error(`Erro no upload para o Storage: ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        await supabase.storage.from('logos').remove([filePath]);
        throw new Error("Não foi possível obter a URL pública do logo após o upload.");
      }
      const logoStorageUrl = publicUrlData.publicUrl;

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          logo_url: logoStorageUrl,
          logo_path_storage: filePath // Salvar o path para futura remoção
        }
      });

      if (updateUserError) {
        await supabase.storage.from('logos').remove([filePath]);
        throw new Error(`Erro ao atualizar perfil com nova logo: ${updateUserError.message}`);
      }

      await refreshSession(); // Atualiza os dados do usuário no useAuth
      setCurrentLogoUrl(logoStorageUrl);
      setPreview(null); 

      if(onUploadSuccess) { // Chama o callback
        await onUploadSuccess();
      }

      toast({
        title: "Logo atualizada",
        description: "A logo do seu escritório foi atualizada com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro completo ao fazer upload:', error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao tentar fazer o upload da logo. Tente fazer login novamente se o problema persistir.",
        variant: "destructive"
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const displayLogoUrl = preview || currentLogoUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
          {displayLogoUrl ? (
            <img
              src={displayLogoUrl}
              alt="Logo do escritório"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-400">Sem logo</span>
          )}
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            disabled={uploading || !user || !session}
            className="relative border-gray-300 hover:bg-gray-100"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-lawyer-primary rounded-full"></div>
                Enviando...
              </div>
            ) : (
              <div className="flex items-center text-gray-700">
                <Upload className="mr-2 h-4 w-4" />
                {currentLogoUrl ? 'Alterar Logo' : 'Enviar Logo'}
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleFileChange}
              disabled={uploading || !user || !session}
            />
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Máximo 1MB. Formatos: JPG, PNG, GIF, WEBP
          </p>
          {(!user || !session) && (
            <p className="text-xs text-red-500 mt-1">
              Faça login para enviar uma logo
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
