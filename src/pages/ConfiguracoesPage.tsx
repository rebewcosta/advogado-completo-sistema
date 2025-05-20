// src/pages/ConfiguracoesPage.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import PerfilTab from '@/components/configuracoes/PerfilTab';
import EscritorioTab from '@/components/configuracoes/EscritorioTab';
import NotificacoesTab from '@/components/configuracoes/NotificacoesTab';
import SegurancaTab from '@/components/configuracoes/SegurancaTab';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { User, Building, Bell, Shield, CreditCard } from 'lucide-react';

// Definindo tipos para as configurações para clareza
interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  oab: string;
}

interface OfficeSettings {
  companyName: string;
  cnpj: string;
  address: string;
  website: string;
  // logo_url é tratado pelo LogoUpload e user_metadata.logo_url
}

interface NotificationPreferences {
  pref_notificacoes_push: boolean;
  pref_alertas_prazo: boolean;
  pref_relatorio_semanal: boolean;
}

interface SecurityPreferences {
  pref_seguranca_dois_fatores: boolean;
  pref_seguranca_tempo_sessao_min: string; // Manter como string para o input number
  pref_seguranca_restricao_ip: boolean;
  // pref_seguranca_ips_permitidos: string[]; // Para o futuro
}


const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isSaving, setIsSaving] = useState(false); // Renomeado de 'saving' para 'isSaving'
  const { user, signOut, refreshSession } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);


  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    name: "", email: "", phone: "", oab: "",
  });

  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>({
    companyName: "Meu Escritório de Advocacia", cnpj: "", address: "", website: "",
  });

  // Estados para as novas preferências, inicializados com valores padrão
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>({
    pref_notificacoes_push: true,
    pref_alertas_prazo: true,
    pref_relatorio_semanal: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecurityPreferences>({
    pref_seguranca_dois_fatores: false,
    pref_seguranca_tempo_sessao_min: "30",
    pref_seguranca_restricao_ip: false,
  });

  // Carregar todas as configurações dos user_metadata
  const loadUserSettings = useCallback(() => {
    if (user && user.user_metadata) {
      console.log("Carregando configurações do user.user_metadata:", user.user_metadata);
      setProfileSettings({
        name: user.user_metadata.nome || user.email?.split('@')[0] || "",
        email: user.email || "",
        phone: user.user_metadata.telefone || "",
        oab: user.user_metadata.oab || "",
      });
      setOfficeSettings({
        companyName: user.user_metadata.empresa || "Meu Escritório de Advocacia",
        cnpj: user.user_metadata.cnpj || "",
        address: user.user_metadata.endereco || "",
        website: user.user_metadata.website || "",
      });
      setNotificationSettings({
        pref_notificacoes_push: typeof user.user_metadata.pref_notificacoes_push === 'boolean' ? user.user_metadata.pref_notificacoes_push : true,
        pref_alertas_prazo: typeof user.user_metadata.pref_alertas_prazo === 'boolean' ? user.user_metadata.pref_alertas_prazo : true,
        pref_relatorio_semanal: typeof user.user_metadata.pref_relatorio_semanal === 'boolean' ? user.user_metadata.pref_relatorio_semanal : false,
      });
      setSecuritySettings({
        pref_seguranca_dois_fatores: typeof user.user_metadata.pref_seguranca_dois_fatores === 'boolean' ? user.user_metadata.pref_seguranca_dois_fatores : false,
        pref_seguranca_tempo_sessao_min: String(user.user_metadata.pref_seguranca_tempo_sessao_min || "30"),
        pref_seguranca_restricao_ip: typeof user.user_metadata.pref_seguranca_restricao_ip === 'boolean' ? user.user_metadata.pref_seguranca_restricao_ip : false,
      });
    }
    setIsLoadingPageData(false);
  }, [user]); // Dependência 'user'

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]); // Executa ao montar e quando 'loadUserSettings' (que depende de 'user') muda

  const handleSaveAllSettings = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    console.log("Salvando configurações:", { profileSettings, officeSettings, notificationSettings, securitySettings });
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          // Perfil
          nome: profileSettings.name,
          telefone: profileSettings.phone,
          oab: profileSettings.oab,
          // Escritório (logo_url é tratado separadamente pelo LogoUpload)
          empresa: officeSettings.companyName,
          cnpj: officeSettings.cnpj,
          endereco: officeSettings.address,
          website: officeSettings.website,
          // Notificações
          pref_notificacoes_push: notificationSettings.pref_notificacoes_push,
          pref_alertas_prazo: notificationSettings.pref_alertas_prazo,
          pref_relatorio_semanal: notificationSettings.pref_relatorio_semanal,
          // Segurança
          pref_seguranca_dois_fatores: securitySettings.pref_seguranca_dois_fatores,
          pref_seguranca_tempo_sessao_min: parseInt(securitySettings.pref_seguranca_tempo_sessao_min, 10) || 30,
          pref_seguranca_restricao_ip: securitySettings.pref_seguranca_restricao_ip,
        }
      });

      if (error) throw error;
      
      await refreshSession(); // Importante para atualizar o user.user_metadata no useAuth
      // loadUserSettings(); // Re-carrega as configurações para refletir o estado atualizado do user.user_metadata
                           // O refreshSession no useAuth já deve disparar o useEffect que chama loadUserSettings

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao tentar salvar.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      // A navegação já é feita pelo signOut no useAuth
    } catch (error) {
      console.error("Erro ao fazer logout na página de configurações:", error);
      // O toast de erro já é mostrado pelo useAuth se necessário
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoadingPageData && !user) { // Mostra spinner apenas se estiver carregando e user ainda não definido
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" />
          <p className="ml-2">Carregando configurações...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <ConfiguracoesHeader
          saving={isSaving}
          loggingOut={loggingOut}
          onSave={handleSaveAllSettings}
          onSignOut={handleSignOut}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 p-1 rounded-lg bg-gray-100">
            <TabsTrigger value="perfil" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="escritorio" className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 text-xs sm:text-sm">
              <Building className="h-4 w-4" /> Escritório
            </TabsTrigger>
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

          <TabsContent value="assinatura">
            <Card>
              <CardHeader>
                <CardTitle>Minha Conta e Assinatura</CardTitle>
                <CardDescription>
                  Visualize o status da sua conta e os detalhes da sua assinatura.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GerenciarAssinatura />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            {/* Passando os nomes corretos das props para NotificacoesTab */}
            <NotificacoesTab
              notificationSettings={{ // Objeto esperado por NotificacoesTab
                pushNotifications: notificationSettings.pref_notificacoes_push,
                deadlineAlerts: notificationSettings.pref_alertas_prazo,
                weeklyReport: notificationSettings.pref_relatorio_semanal,
              }}
              setNotificationSettings={(newSettings) => {
                // newSettings virá com as chaves de NotificacoesTab (pushNotifications, etc.)
                // Precisamos mapear de volta para as chaves do nosso estado (pref_notificacoes_push, etc.)
                setNotificationSettings(prev => ({
                  ...prev,
                  // @ts-ignore newSettings pode ser um callback (value) => {}
                  pref_notificacoes_push: typeof newSettings.pushNotifications === 'boolean' ? newSettings.pushNotifications : prev.pref_notificacoes_push,
                  // @ts-ignore
                  pref_alertas_prazo: typeof newSettings.deadlineAlerts === 'boolean' ? newSettings.deadlineAlerts : prev.pref_alertas_prazo,
                  // @ts-ignore
                  pref_relatorio_semanal: typeof newSettings.weeklyReport === 'boolean' ? newSettings.weeklyReport : prev.pref_relatorio_semanal,
                }));
              }}
            />
          </TabsContent>

          <TabsContent value="seguranca">
             {/* Passando os nomes corretos das props para SegurancaTab */}
            <SegurancaTab
              securitySettings={{ // Objeto esperado por SegurancaTab
                  twoFactor: securitySettings.pref_seguranca_dois_fatores,
                  sessionTimeout: securitySettings.pref_seguranca_tempo_sessao_min,
                  ipRestriction: securitySettings.pref_seguranca_restricao_ip,
              }}
              setSecuritySettings={(newSettings) => {
                // newSettings virá com as chaves de SegurancaTab (twoFactor, etc.)
                // Precisamos mapear de volta para as chaves do nosso estado
                 setSecuritySettings(prev => ({
                    ...prev,
                    // @ts-ignore
                    pref_seguranca_dois_fatores: typeof newSettings.twoFactor === 'boolean' ? newSettings.twoFactor : prev.pref_seguranca_dois_fatores,
                    // @ts-ignore
                    pref_seguranca_tempo_sessao_min: typeof newSettings.sessionTimeout === 'string' ? newSettings.sessionTimeout : prev.pref_seguranca_tempo_sessao_min,
                    // @ts-ignore
                    pref_seguranca_restricao_ip: typeof newSettings.ipRestriction === 'boolean' ? newSettings.ipRestriction : prev.pref_seguranca_restricao_ip,
                 }));
              }}
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