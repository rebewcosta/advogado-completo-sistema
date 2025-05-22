// src/components/configuracoes/EscritorioTab.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import LogoUpload from '@/components/configuracoes/LogoUpload';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface EscritorioTabProps {
  officeSettings: {
    companyName: string;
    cnpj: string;
    address: string;
    website: string;
  };
  setOfficeSettings: React.Dispatch<React.SetStateAction<{
    companyName: string;
    cnpj: string;
    address: string;
    website: string;
    logo_url?: string | null; // Adicionado para receber do pai
  }>>;
  currentLogoUrl?: string | null; // Receber a URL do logo
  onLogoUpdate: () => Promise<void>; // Callback para quando o logo for atualizado
}

const EscritorioTab = ({ officeSettings, setOfficeSettings, currentLogoUrl, onLogoUpdate }: EscritorioTabProps) => {
  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Dados do Escritório</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Configure as informações do seu escritório de advocacia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="companyName_config_esc" className="text-sm font-medium text-gray-700">Nome do Escritório</Label>
            <Input 
              id="companyName_config_esc" 
              value={officeSettings.companyName}
              onChange={(e) => setOfficeSettings({...officeSettings, companyName: e.target.value})}
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnpj_config_esc" className="text-sm font-medium text-gray-700">CNPJ</Label>
            <Input 
              id="cnpj_config_esc" 
              value={officeSettings.cnpj}
              onChange={(e) => setOfficeSettings({...officeSettings, cnpj: e.target.value})}
              placeholder="00.000.000/0000-00"
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address_config_esc" className="text-sm font-medium text-gray-700">Endereço Completo</Label>
            <Input 
              id="address_config_esc" 
              value={officeSettings.address}
              onChange={(e) => setOfficeSettings({...officeSettings, address: e.target.value})}
              placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website_config_esc" className="text-sm font-medium text-gray-700">Website</Label>
            <Input 
              id="website_config_esc"
              type="url"
              value={officeSettings.website}
              onChange={(e) => setOfficeSettings({...officeSettings, website: e.target.value})}
              placeholder="https://www.seuescritorio.com.br"
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Logo do Escritório</Label>
          <p className="text-xs text-gray-500 mb-3">
            Faça upload da logo do seu escritório (PNG, JPG, GIF - Máx. 1MB). Esta logo aparecerá em relatórios e documentos futuros.
          </p>
          <LogoUpload 
            // O componente LogoUpload agora buscará o logo_url do user.user_metadata via useAuth
            // e usará o refreshSession para atualizar a UI após o upload.
            // A prop onLogoUpdate pode ser usada para forçar o re-render da ConfiguracoesPage se necessário.
            onUploadSuccess={onLogoUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EscritorioTab;