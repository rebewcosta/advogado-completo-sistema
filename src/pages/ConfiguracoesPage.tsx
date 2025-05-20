// src/pages/ConfiguracoesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

interface ProfileSettings { name: string; email: string; phone: string; oab: string; }
interface OfficeSettings { companyName: string; cnpj: string; address: string; website: string; }
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
    companyName: "Meu Escritório de Advocacia", cnpj: "", address: "", website: "",
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

  const loadUserSettings = useCallback(() => {
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
        data: {
          nome: profileSettings.name,
          telefone: profileSettings.phone,
          oab: profileSettings.oab,
          empresa: officeSettings.companyName,
          cnpj: officeSettings.cnpj,
          endereco: officeSettings.address,
          website: officeSettings.website,
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

    setIsSaving(true); // Reutiliza o estado isSaving ou crie um específico para PIN se preferir
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
        // A função loadUserSettings será chamada novamente pelo useEffect que depende de 'user' (após refreshSession)
        // e atualizará 'hasFinancePin'
        setHasFinancePin(true); // Pode adiantar a atualização do estado local
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

  if (isLoadingPageData || (user && isLoadingPinStatus)) {
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
            <NotificacoesTab
              notificationSettings={{
                pushNotifications: notificationSettings.pref_notificacoes_push,
                deadlineAlerts: notificationSettings.pref_alertas_prazo,
                weeklyReport: notificationSettings.pref_relatorio_semanal,
              }}
              setNotificationSettings={(newSettings) => {
                setNotificationSettings(prev => ({
                  ...prev,
                  // @ts-ignore
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
            <SegurancaTab
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
              hasFinancePin={hasFinancePin} 
              onChangeFinanceiroPin={handleChangeFinanceiroPin} 
              isSavingPin={isSaving} 
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