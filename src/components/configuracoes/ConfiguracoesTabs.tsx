// src/components/configuracoes/ConfiguracoesTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PerfilTab from "./PerfilTab";
import EscritorioTab from "./EscritorioTab";
import NotificacoesTab from "./NotificacoesTab";
import SegurancaTab from "./SegurancaTab";
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';
import InstalarAppTab from "./InstalarAppTab"; // Importar o novo componente da aba de instalação

const ConfiguracoesTabs = () => {
  return (
    <Tabs defaultValue="perfil" className="w-full">
      {/* Ajustadas as colunas para acomodar 6 abas. Pode necessitar de mais ajustes finos de layout dependendo da sua preferência. */}
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 sm:gap-2 mb-4">
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="escritorio">Escritório</TabsTrigger>
        <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        <TabsTrigger value="aplicativo">Aplicativo</TabsTrigger> {/* Novo Trigger para a aba Aplicativo */}
      </TabsList>
      <TabsContent value="perfil">
        <PerfilTab />
      </TabsContent>
      <TabsContent value="escritorio">
        <EscritorioTab />
      </TabsContent>
      <TabsContent value="notificacoes">
        <NotificacoesTab />
      </TabsContent>
      <TabsContent value="seguranca">
        <SegurancaTab />
      </TabsContent>
      <TabsContent value="assinatura">
        <GerenciarAssinatura />
      </TabsContent>
      <TabsContent value="aplicativo"> {/* Novo Content para a aba Aplicativo */}
        <InstalarAppTab />
      </TabsContent>
    </Tabs>
  );
};

export default ConfiguracoesTabs;