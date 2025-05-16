
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

// Import the newly created components
import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import ConfiguracoesTabs from '@/components/configuracoes/ConfiguracoesTabs';
import PerfilTab from '@/components/configuracoes/PerfilTab';
import EscritorioTab from '@/components/configuracoes/EscritorioTab';
import NotificacoesTab from '@/components/configuracoes/NotificacoesTab';
import SegurancaTab from '@/components/configuracoes/SegurancaTab';
import { TabsContent } from '@/components/ui/tabs';

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Estado para configurações de perfil
  const [profileSettings, setProfileSettings] = useState({
    name: user?.user_metadata?.nome || "",
    email: user?.email || "",
    phone: user?.user_metadata?.telefone || "",
    oab: user?.user_metadata?.oab || "",
  });

  // Estado para configurações do escritório
  const [officeSettings, setOfficeSettings] = useState({
    companyName: user?.user_metadata?.empresa || "Meu Escritório de Advocacia",
    cnpj: user?.user_metadata?.cnpj || "",
    address: user?.user_metadata?.endereco || "",
    website: user?.user_metadata?.website || "",
  });

  // Estado para configurações de notificações
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    deadlineAlerts: true,
    weeklyReport: true,
  });

  // Estado para configurações de segurança
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    ipRestriction: false,
  });

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Atualizar metadados do usuário com as configurações do escritório
      const { error } = await supabase.auth.updateUser({
        data: {
          nome: profileSettings.name,
          telefone: profileSettings.phone,
          oab: profileSettings.oab,
          empresa: officeSettings.companyName,
          cnpj: officeSettings.cnpj,
          endereco: officeSettings.address,
          website: officeSettings.website
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao tentar salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <ConfiguracoesHeader 
          saving={saving} 
          loggingOut={loggingOut}
          onSave={handleSave}
          onSignOut={handleSignOut}
        />

        <ConfiguracoesTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        >
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
        </ConfiguracoesTabs>
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
