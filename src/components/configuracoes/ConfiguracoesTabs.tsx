
import React from 'react';
import { User, Building, Bell, Shield } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ConfiguracoesTabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
}

const ConfiguracoesTabs = ({ activeTab, setActiveTab, children }: ConfiguracoesTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-gray-100 p-1 rounded-lg">
        <TabsTrigger value="perfil" className="flex items-center">
          <User className="h-4 w-4 mr-2" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="escritorio" className="flex items-center">
          <Building className="h-4 w-4 mr-2" />
          Escritório
        </TabsTrigger>
        <TabsTrigger value="notificacoes" className="flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notificações
        </TabsTrigger>
        <TabsTrigger value="seguranca" className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Segurança
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default ConfiguracoesTabs;
