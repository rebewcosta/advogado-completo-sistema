
// src/components/configuracoes/ConfiguracoesTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';
import InstalarAppTab from "./InstalarAppTab";

interface ConfiguracoesTabsProps {
  activeTabValue?: string;
}

const ConfiguracoesTabs = ({ activeTabValue }: ConfiguracoesTabsProps) => {
  // Se o activeTabValue for "assinatura", mostra apenas a aba de assinatura
  if (activeTabValue === "assinatura") {
    return (
      <div className="w-full">
        <GerenciarAssinatura />
      </div>
    );
  }
  
  // Se o activeTabValue for "aplicativo", mostra apenas a aba de aplicativo
  if (activeTabValue === "aplicativo") {
    return (
      <div className="w-full">
        <InstalarAppTab />
      </div>
    );
  }

  // Fallback para o comportamento original (não deveria ser usado mais)
  return (
    <Tabs defaultValue="assinatura" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 mb-4">
        <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        <TabsTrigger value="aplicativo">Aplicativo</TabsTrigger>
      </TabsList>
      <TabsContent value="assinatura">
        <GerenciarAssinatura />
      </TabsContent>
      <TabsContent value="aplicativo">
        <InstalarAppTab />
      </TabsContent>
    </Tabs>
  );
};

export default ConfiguracoesTabs;
