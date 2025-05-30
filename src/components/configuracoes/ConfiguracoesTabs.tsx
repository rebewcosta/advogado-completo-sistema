
// src/components/configuracoes/ConfiguracoesTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';
import InstalarAppTab from "./InstalarAppTab";

const ConfiguracoesTabs = () => {
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
