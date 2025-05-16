
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface PerfilTabProps {
  profileSettings: {
    name: string;
    email: string;
    phone: string;
    oab: string;
  };
  setProfileSettings: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    oab: string;
  }>>;
}

const PerfilTab = ({ profileSettings, setProfileSettings }: PerfilTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e de contato
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input 
              id="name" 
              value={profileSettings.name}
              onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email"
              value={profileSettings.email}
              onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input 
              id="phone" 
              value={profileSettings.phone}
              onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oab">Número OAB</Label>
            <Input 
              id="oab" 
              value={profileSettings.oab}
              onChange={(e) => setProfileSettings({...profileSettings, oab: e.target.value})}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerfilTab;
