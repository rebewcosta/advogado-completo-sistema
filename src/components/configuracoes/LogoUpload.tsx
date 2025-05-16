
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const LogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
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
      return;
    }

    // Verificar se é uma imagem
    if (!file.type.match('image.*')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    // Criar uma URL para preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      // Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-logo.${fileExt}`;

      // Salvar como metadado do usuário
      const urlToDataPromise = fetch(URL.createObjectURL(file))
        .then(response => response.blob())
        .then(blob => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

      const base64Data = await urlToDataPromise;
      
      // Atualizar os metadados do usuário
      const { error } = await supabase.auth.updateUser({
        data: { 
          logo: base64Data
        }
      });

      if (error) throw error;

      // Atualizar a sessão para refletir as mudanças
      await refreshSession();
      
      toast({
        title: "Logo atualizada",
        description: "A logo do seu escritório foi atualizada com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao tentar fazer o upload da logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {(preview || user?.user_metadata?.logo) && (
          <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
            <img 
              src={preview || user?.user_metadata?.logo} 
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
                Enviar Logo
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Tamanho máximo: 1MB. Formatos: JPG, PNG
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
