// src/components/configuracoes/PerfilTab.tsx
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
    dataNascimento: string;
  };
  setProfileSettings: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    dataNascimento: string;
  }>>;
}

const PerfilTab = ({ profileSettings, setProfileSettings }: PerfilTabProps) => {
  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Informações Pessoais</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Gerencie suas informações pessoais e de contato.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name_config_perfil" className="text-sm font-medium text-gray-700">Nome completo</Label>
            <Input 
              id="name_config_perfil" 
              value={profileSettings.name}
              onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
              placeholder="Seu nome completo"
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email_config_perfil" className="text-sm font-medium text-gray-700">E-mail</Label>
            <Input 
              id="email_config_perfil" 
              type="email"
              value={profileSettings.email}
              readOnly // Email geralmente não é editável diretamente no perfil por questões de autenticação
              className="bg-gray-100 cursor-not-allowed border-gray-300"
            />
            <p className="text-xs text-gray-500">O e-mail de login não pode ser alterado aqui.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataNascimento_config_perfil" className="text-sm font-medium text-gray-700">Data de Nascimento</Label>
            <Input 
              id="dataNascimento_config_perfil" 
              type="date"
              value={profileSettings.dataNascimento}
              onChange={(e) => setProfileSettings({...profileSettings, dataNascimento: e.target.value})}
              className="border-gray-300 focus:border-lawyer-primary focus:ring-lawyer-primary"
            />
          </div>
        </div>
        {/* O botão de salvar foi movido para o ConfiguracoesHeader */}
      </CardContent>
    </Card>
  );
};

export default PerfilTab;