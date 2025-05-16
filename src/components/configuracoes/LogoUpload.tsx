import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const LogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();

  useEffect(() => {
    if (user?.user_metadata?.logo_url) {
      setCurrentLogoUrl(user.user_metadata.logo_url as string);
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para enviar uma logo.",
        variant: "destructive"
      });
      return;
    }

    const file = e.target.files[0];

    // Verificar o tamanho do arquivo (até 1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 1MB",
        variant: "destructive"
      });
      e.target.value = ''; // Limpar o input
      return;
    }

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos de imagem (JPG, PNG, etc.)",
        variant: "destructive"
      });
      e.target.value = ''; // Limpar o input
      return;
    }

    // Criar uma URL para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      // Gerar um nome de arquivo único para o Storage
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `public/${user.id}/logo-${Date.now()}.${fileExt}`; // Caminho no bucket 'logos'

      // Fazer upload do arquivo para o Supabase Storage no bucket 'logos'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos') // Nome do seu bucket público
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // true para sobrescrever se já existir um logo para esse usuário com o mesmo path
        });

      if (uploadError) {
        console.error('Erro no upload para o Supabase Storage:', uploadError);
        throw new Error(`Erro no upload para o Storage: ${uploadError.message}`);
      }

      // Obter a URL pública do arquivo que foi salvo no Storage
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        // Se não conseguir a URL pública, tentar remover o arquivo que acabou de ser upado para não deixar lixo
        await supabase.storage.from('logos').remove([filePath]);
        throw new Error("Não foi possível obter a URL pública do logo após o upload.");
      }
      const logoStorageUrl = publicUrlData.publicUrl;
      console.log('Logo URL do Storage:', logoStorageUrl);

      // Atualizar os metadados do usuário com a URL do Storage
      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          logo_url: logoStorageUrl // Salvar a URL do storage, não o base64
        }
      });

      if (updateUserError) {
        console.error('Erro ao atualizar metadados do usuário:', updateUserError);
        // Se falhar ao atualizar metadados, considerar remover o arquivo do storage
        // ou notificar o usuário para tentar novamente.
        await supabase.storage.from('logos').remove([filePath]);
        throw new Error(`Erro ao atualizar perfil com nova logo: ${updateUserError.message}`);
      }

      // Atualizar a sessão para refletir as mudanças nos metadados
      await refreshSession();
      setCurrentLogoUrl(logoStorageUrl); // Atualiza a URL do logo exibida localmente
      setPreview(null); // Limpar o preview local pois agora usaremos a URL do storage

      toast({
        title: "Logo atualizada",
        description: "A logo do seu escritório foi atualizada com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro completo ao fazer upload:', error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao tentar fazer o upload da logo. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
      setPreview(null); // Limpar preview em caso de erro
    } finally {
      setUploading(false);
      // Limpar o valor do input de arquivo para permitir novo upload do mesmo arquivo se necessário
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const displayLogoUrl = preview || currentLogoUrl;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {displayLogoUrl && (
          <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
            <img
              src={displayLogoUrl}
              alt="Logo do escritório"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        <div>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="relative"
          >
            {uploading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-primary rounded-full"></div>
                Enviando...
              </div>
            ) : (
              <div className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                {currentLogoUrl ? 'Alterar Logo' : 'Enviar Logo'}
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif, image/webp"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo 1MB. Formatos: JPG, PNG, GIF, WEBP
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;