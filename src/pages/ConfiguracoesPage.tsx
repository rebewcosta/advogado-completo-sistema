// Caminho: advogado-completo-sistema-main/src/pages/ConfiguracoesPage.tsx
import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import ConfiguracoesTabs from '@/components/configuracoes/ConfiguracoesTabs'; // Seu componente de wrapper das abas
import PerfilTab from '@/components/configuracoes/PerfilTab';
import EscritorioTab from '@/components/configuracoes/EscritorioTab';
import NotificacoesTab from '@/components/configuracoes/NotificacoesTab';
import SegurancaTab from '@/components/configuracoes/SegurancaTab';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura'; // IMPORTAR O COMPONENTE
import { TabsContent, TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs'; // Importar Tabs diretamente se ConfiguracoesTabs não for usado
import { User, Building, Bell, Shield, CreditCard } from 'lucide-react'; // Adicionar CreditCard

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil"); // Aba padrão
  const [saving, setSaving] = useState(false);
  const { user, signOut, refreshSession } = useAuth(); // Adicionado refreshSession
  const [loggingOut, setLoggingOut] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
    oab: "",
  });

  const [officeSettings, setOfficeSettings] = useState({
    companyName: "Meu Escritório de Advocacia",
    cnpj: "",
    address: "",
    website: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    deadlineAlerts: true,
    weeklyReport: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    ipRestriction: false,
  });

  // Carregar configurações iniciais do usuário
  useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.user_metadata?.nome || user.email?.split('@')[0] || "",
        email: user.email || "",
        phone: user.user_metadata?.telefone || "",
        oab: user.user_metadata?.oab || "",
      });
      setOfficeSettings({
        companyName: user.user_metadata?.empresa || "Meu Escritório de Advocacia",
        cnpj: user.user_metadata?.cnpj || "",
        address: user.user_metadata?.endereco || "",
        website: user.user_metadata?.website || "",
      });
      // Carregar outras configurações (notificações, segurança) se estiverem nos metadados
      // Ex: setNotificationSettings(user.user_metadata?.notifications || { pushNotifications: true, ... });
    }
  }, [user]);


  const handleSaveAllSettings = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { // User Metadata
          nome: profileSettings.name,
          telefone: profileSettings.phone,
          oab: profileSettings.oab,
          empresa: officeSettings.companyName,
          cnpj: officeSettings.cnpj,
          endereco: officeSettings.address,
          website: officeSettings.website,
          // Adicionar aqui as notificationSettings e securitySettings se você quiser salvá-las nos metadados
          // Ex: notification_settings: notificationSettings,
          //     security_settings: securitySettings,
        }
      });

      if (error) throw error;

      await refreshSession(); // Para atualizar o objeto user no contexto Auth

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao tentar salvar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    // ... (manter a lógica de signOut que já funciona)
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  // O componente ConfiguracoesTabs parece ser um wrapper para TabsList e TabsContent.
  // Se ele não for flexível o suficiente, podemos usar Tabs, TabsList, TabsTrigger, TabsContent diretamente.
  // Vou assumir que ConfiguracoesTabs é apenas o <Tabs value={activeTab} onValueChange={setActiveTab}>
  // e que dentro dele colocamos TabsList e TabsContent.
  // Se ConfiguracoesTabs renderiza o children dentro de um TabsContent específico, precisaremos ajustá-lo.
  // Pelo nome, parece que ele já faz o <Tabs> e espera os <TabsList> e <TabsContent> como children.
  // No seu screenshot, os botões das abas estão fora do conteúdo branco, então o ConfiguracoesTabs é o componente <Tabs> em si.

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8"> {/* Padding ajustado */}
        <ConfiguracoesHeader
          saving={saving}
          loggingOut={loggingOut}
          onSave={handleSaveAllSettings} // Agora salva todas as configurações de uma vez
          onSignOut={handleSignOut}
        />

        {/* Usando o componente Tabs diretamente para mais controle, como no seu screenshot */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 p-1 rounded-lg bg-gray-100"> {/* Ajustado para 5 colunas */}
            <TabsTrigger value="perfil" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="escritorio" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <Building className="h-4 w-4" /> Escritório
            </TabsTrigger>
            {/* NOVA ABA DE ASSINATURA */}
            <TabsTrigger value="assinatura" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <CreditCard className="h-4 w-4" /> Assinatura
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <Bell className="h-4 w-4" /> Notificações
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <Shield className="h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <PerfilTab
              profileSettings={profileSettings}
              setProfileSettings={setProfileSettings}
            />
          </TabsContent>

          <TabsContent value="escritorio">
            <EscritorioTab
              officeSettings={officeSettings}
              setOfficeSettings={setOfficeSettings}
            />
          </TabsContent>

          {/* CONTEÚDO DA NOVA ABA DE ASSINATURA */}
          <TabsContent value="assinatura">
            <Card>
              <CardHeader>
                <CardTitle>Minha Conta e Assinatura</CardTitle>
                <CardDescription>
                  Visualize o status da sua conta e os detalhes da sua assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarAssinatura /> {/* Aqui entra o componente que busca e mostra os dados */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <NotificacoesTab
              notificationSettings={notificationSettings}
              setNotificationSettings={setNotificationSettings}
            />
          </TabsContent>

          <TabsContent value="seguranca">
            <SegurancaTab
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer
        companyName={officeSettings.companyName}
        address={officeSettings.address}
        cnpj={officeSettings.cnpj}
        website={officeSettings.website}
      />
    </AdminLayout>
  );
};

export default ConfiguracoesPage;