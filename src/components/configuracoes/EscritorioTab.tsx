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
import { Building, Image as ImageIcon } from 'lucide-react'; // Ícones

interface OfficeSettings {
  companyName: string;
  cnpj: string;
  address: string;
  website: string;
  logo_url?: string | null;
}

interface EscritorioTabProps {
  officeSettings: OfficeSettings;
  setOfficeSettings: React.Dispatch<React.SetStateAction<OfficeSettings>>;
  currentLogoUrl?: string | null; // Receber a URL do logo
  onLogoUpdate: () => Promise<void>; // Callback para quando o logo for atualizado
}

const EscritorioTab = ({ officeSettings, setOfficeSettings, onLogoUpdate }: EscritorioTabProps) => {
  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
          <Building className="mr-2 h-6 w-6 text-lawyer-primary" />
          Dados do Escritório
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 pt-1">
          Configure as informações públicas e de identificação do seu escritório de advocacia.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        {/* Dados Cadastrais */}
        <div className="p-4 md:p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
            <h3 className="text-md font-medium text-gray-700 mb-4">Informações Cadastrais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <Label htmlFor="companyName_config_esc" className="text-sm font-medium text-gray-700">Nome do Escritório</Label>
                <Input 
                id="companyName_config_esc" 
                value={officeSettings.companyName}
                onChange={(e) => setOfficeSettings(prev => ({...prev, companyName: e.target.value}))}
                className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                placeholder="Ex: Advocacia Silva & Associados"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="oab_config_esc" className="text-sm font-medium text-gray-700">OAB</Label>
                <Input 
                id="oab_config_esc" 
                value={officeSettings.cnpj}
                onChange={(e) => setOfficeSettings(prev => ({...prev, cnpj: e.target.value}))}
                placeholder="Ex: OAB/SP 123.456"
                className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                />
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address_config_esc" className="text-sm font-medium text-gray-700">Endereço Completo</Label>
                <Input 
                id="address_config_esc" 
                value={officeSettings.address}
                onChange={(e) => setOfficeSettings(prev => ({...prev, address: e.target.value}))}
                placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="website_config_esc" className="text-sm font-medium text-gray-700">Website (Opcional)</Label>
                <Input 
                id="website_config_esc"
                type="url"
                value={officeSettings.website}
                onChange={(e) => setOfficeSettings(prev => ({...prev, website: e.target.value}))}
                placeholder="https://www.seuescritorio.com.br"
                className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
                />
            </div>
            </div>
        </div>
        
        {/* Seção da Logo */}
        <div className="p-4 md:p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-lawyer-primary" />
                <h3 className="text-md font-medium text-gray-700">Logo do Escritório</h3>
            </div>
          <p className="text-xs text-gray-500 mb-4">
            Faça upload da imagem da sua marca (PNG, JPG - Máx. 1MB). Esta logo poderá ser usada em relatórios futuros.
          </p>
          <LogoUpload 
            onUploadSuccess={onLogoUpdate} // Este callback atualiza o estado na ConfiguracoesPage
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EscritorioTab;