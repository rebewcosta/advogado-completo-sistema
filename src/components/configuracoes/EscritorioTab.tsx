
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
  }>>;
}

const EscritorioTab = ({ officeSettings, setOfficeSettings }: EscritorioTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Escritório</CardTitle>
        <CardDescription>
          Configure as informações do seu escritório de advocacia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome do Escritório</Label>
            <Input 
              id="companyName" 
              value={officeSettings.companyName}
              onChange={(e) => setOfficeSettings({...officeSettings, companyName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input 
              id="cnpj" 
              value={officeSettings.cnpj}
              onChange={(e) => setOfficeSettings({...officeSettings, cnpj: e.target.value})}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Input 
              id="address" 
              value={officeSettings.address}
              onChange={(e) => setOfficeSettings({...officeSettings, address: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={officeSettings.website}
              onChange={(e) => setOfficeSettings({...officeSettings, website: e.target.value})}
            />
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label>Logo do Escritório</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Faça upload da logo do seu escritório (até 1MB)
          </p>
          <LogoUpload />
        </div>
      </CardContent>
    </Card>
  );
};

export default EscritorioTab;
