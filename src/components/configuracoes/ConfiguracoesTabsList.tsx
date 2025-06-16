
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building, Bell, Shield, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfiguracoesTabsListProps {
  activeTab: string;
}

const ConfiguracoesTabsList = ({ activeTab }: ConfiguracoesTabsListProps) => {
  const tabs = [
    { value: "perfil", label: "Perfil", icon: User },
    { value: "escritorio", label: "Escritório", icon: Building },
    { value: "assinatura", label: "Assinatura", icon: CreditCard },
    { value: "aplicativo", label: "Aplicativo", icon: Smartphone },
    { value: "notificacoes", label: "Notificações", icon: Bell },
    { value: "seguranca", label: "Segurança", icon: Shield },
  ];

  return (
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 mb-6 md:mb-8 h-auto">
      {tabs.map(tab => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            "flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 text-xs sm:text-sm rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lawyer-primary focus-visible:ring-offset-2 focus-visible:ring-offset-lawyer-background",
            activeTab === tab.value
              ? "bg-white dark:bg-gray-700 text-lawyer-primary shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50"
          )}
        >
          <tab.icon className="h-4 w-4" /> {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ConfiguracoesTabsList;
