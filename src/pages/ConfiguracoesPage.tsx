// src/pages/ConfiguracoesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import PerfilTab from '@/components/configuracoes/PerfilTab';
import EscritorioTab from '@/components/configuracoes/EscritorioTab';
import NotificacoesTab from '@/components/configuracoes/NotificacoesTab';
import SegurancaTab from '@/components/configuracoes/SegurancaTab';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { User, Building, Bell, Shield, CreditCard, Settings as SettingsPageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSettings { name: string; email: string; phone: string; oab: string; }
interface OfficeSettings { companyName: string; cnpj: string; address: string; website: string; logo_url?: string | null; } // Adicionado logo_url
interface NotificationPreferences { pref_notificacoes_push: boolean; pref_alertas_prazo: boolean; pref_relatorio_semanal: boolean; }
interface SecurityPreferences { pref_seguranca_dois_fatores: boolean; pref_seguranca_tempo_sessao_min: string; pref_seguranca_restricao_ip: boolean; }

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [isSaving, setIsSaving] = useState(false);
  const { user, signOut, refreshSession, session } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);
  
  const [hasFinancePin, setHasFinancePin] = useState(false);
  const [isLoadingPinStatus, setIsLoadingPinStatus] = useState(true);

  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    name: "", email: "", phone: "", oab: "",
  });
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings>({
    companyName: "Meu Escritório de Advocacia", cnpj: "", address: "", website: "", logo_url: null,
  });
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

  const loadUserSettings = useCallback(async () => {
    if (user && user.user_metadata) {
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
        logo_url: user.user_metadata.logo_url || null,
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
      setHasFinancePin(!!user.user_metadata.finance_pin_hash);
    }
    setIsLoadingPageData(false);
    setIsLoadingPinStatus(false);
  }, [user]);

  useEffect(() => {
    setIsLoadingPageData(true);
    setIsLoadingPinStatus(true);
    if (user) {
      loadUserSettings();
    } else {
      setIsLoadingPageData(false);
      setIsLoadingPinStatus(false);
    }
  }, [user, loadUserSettings]);

  const handleSaveAllSettings = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { // Supabase.auth.updateUser atualiza user_metadata.
          nome: profileSettings.name || null,
          telefone: profileSettings.phone || null,
          oab: profileSettings.oab || null,
          empresa: officeSettings.companyName || null,
          cnpj: officeSettings.cnpj || null,
          endereco: officeSettings.address || null,
          website: officeSettings.website || null,
          // logo_url é atualizado pelo LogoUpload component diretamente.
          pref_notificacoes_push: notificationSettings.pref_notificacoes_push,
          pref_alertas_prazo: notificationSettings.pref_alertas_prazo,
          pref_relatorio_semanal: notificationSettings.pref_relatorio_semanal,
          pref_seguranca_dois_fatores: securitySettings.pref_seguranca_dois_fatores,
          pref_seguranca_tempo_sessao_min: parseInt(securitySettings.pref_seguranca_tempo_sessao_min, 10) || 30,
          pref_seguranca_restricao_ip: securitySettings.pref_seguranca_restricao_ip,
        }
      });
      if (error) throw error;
      await refreshSession(); 
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
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      // Erro já tratado no useAuth
    } finally {
      setLoggingOut(false);
    }
  };

  const handleChangeFinanceiroPin = async (currentPinPlainText: string | null, newPinPlainText: string) => {
    if (!session) {
        toast({ title: "Erro de Autenticação", description: "Sessão não encontrada.", variant: "destructive" });
        return false;
    }
    if (newPinPlainText.length !== 4) {
        toast({ title: "PIN Inválido", description: "O novo PIN deve ter 4 dígitos.", variant: "destructive" });
        return false;
    }
    if (hasFinancePin && (!currentPinPlainText || currentPinPlainText.length !== 4)) {
        toast({ title: "PIN Atual Inválido", description: "O PIN atual é obrigatório e deve ter 4 dígitos.", variant: "destructive" });
        return false;
    }

    setIsSaving(true);
    try {
        const { data, error } = await supabase.functions.invoke('set-finance-pin', {
            body: { 
                currentPin: hasFinancePin ? currentPinPlainText : null, 
                newPin: newPinPlainText 
            },
        });

        if (error || (data && data.error)) {
            const errorMessage = (data && data.error) || error?.message || "Erro desconhecido ao definir PIN.";
            throw new Error(errorMessage);
        }

        toast({
            title: hasFinancePin ? "PIN do Financeiro Alterado" : "PIN do Financeiro Definido",
            description: data.message || `O PIN de acesso à página Financeiro foi ${hasFinancePin ? 'atualizado' : 'definido'}.`,
        });
        await refreshSession();
        setHasFinancePin(true);
        setIsSaving(false);
        return true;

    } catch (error: any) {
        toast({
            title: "Erro ao Salvar PIN",
            description: error.message,
            variant: "destructive",
        });
        setIsSaving(false);
        return false;
    }
  };

  if (isLoadingPageData || isLoadingPinStatus) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen bg-lawyer-background">
          <Spinner size="lg" />
          <p className="ml-3 text-gray-600">Carregando configurações...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
            <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
                    <SettingsPageIcon className="mr-3 h-7 w-7 text-lawyer-primary" />
                    Configurações da Conta
                </h1>
                <p className="text-gray-600 text-left mt-1">
                    Personalize suas informações e preferências do sistema.
                </p>
            </div>
            <ConfiguracoesHeader
              saving={isSaving}
              loggingOut={loggingOut}
              onSave={handleSaveAllSettings}
              onSignOut={handleSignOut}
            />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0"> {/* Removido mt-6 */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 mb-6 md:mb-8 h-auto">
            {[
              { value: "perfil", label: "Perfil", icon: User },
              { value: "escritorio", label: "Escritório", icon: Building },
              { value: "assinatura", label: "Assinatura", icon: CreditCard },
              { value: "notificacoes", label: "Notificações", icon: Bell },
              { value: "seguranca", label: "Segurança", icon: Shield },
            ].map(tab => (
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
              // Passando a URL do logo para o EscritorioTab
              currentLogoUrl={officeSettings.logo_url}
              onLogoUpdate={async () => {
                await refreshSession(); // Atualiza a sessão para pegar a nova URL do logo
                if (user?.user_metadata?.logo_url) { // Recarrega as configurações do escritório
                    setOfficeSettings(prev => ({...prev, logo_url: user.user_metadata.logo_url as string}));
                }
              }}
            />
          </TabsContent>
          <TabsContent value="assinatura">
            <GerenciarAssinatura />
          </TabsContent>
          <TabsContent value="notificacoes">
            <NotificacoesTab
              notificationSettings={{
                pushNotifications: notificationSettings.pref_notificacoes_push,
                deadlineAlerts: notificationSettings.pref_alertas_prazo,
                weeklyReport: notificationSettings.pref_relatorio_semanal,
              }}
              setNotificationSettings={(newSettings) => {
                setNotificationSettings(prev => ({
                  ...prev,
                  pref_notificacoes_push: typeof newSettings.pushNotifications === 'boolean' ? newSettings.pushNotifications : prev.pref_notificacoes_push,
                  pref_alertas_prazo: typeof newSettings.deadlineAlerts === 'boolean' ? newSettings.deadlineAlerts : prev.pref_alertas_prazo,
                  pref_relatorio_semanal: typeof newSettings.weeklyReport === 'boolean' ? newSettings.weeklyReport : prev.pref_relatorio_semanal,
                }));
              }}
            />
          </TabsContent>
          <TabsContent value="seguranca">
            <SegurancaTab
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
              hasFinancePin={hasFinancePin} 
              onChangeFinanceiroPin={handleChangeFinanceiroPin} 
              isSavingPin={isSaving} // Reutilizando isSaving geral ou pode criar um isSavingPin específico
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracoesPage;