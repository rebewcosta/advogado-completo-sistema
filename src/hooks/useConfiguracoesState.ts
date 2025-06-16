
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  logo_url?: string | null; 
}

interface NotificationPreferences { 
  pref_notificacoes_push: boolean; 
  pref_alertas_prazo: boolean; 
  pref_relatorio_semanal: boolean; 
}

interface SecurityPreferences { 
  pref_seguranca_dois_fatores: boolean; 
  pref_seguranca_tempo_sessao_min: string; 
  pref_seguranca_restricao_ip: boolean; 
}

export const useConfiguracoesState = () => {
  const { toast } = useToast();
  const { user, signOut, refreshSession, session } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
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
        data: { 
          nome: profileSettings.name || null,
          telefone: profileSettings.phone || null,
          oab: profileSettings.oab || null,
          empresa: officeSettings.companyName || null,
          cnpj: officeSettings.cnpj || null,
          endereco: officeSettings.address || null,
          website: officeSettings.website || null,
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

  return {
    user,
    session,
    isSaving,
    isLoadingPageData,
    isLoadingPinStatus,
    hasFinancePin,
    profileSettings,
    setProfileSettings,
    officeSettings,
    setOfficeSettings,
    notificationSettings,
    setNotificationSettings,
    securitySettings,
    setSecuritySettings,
    handleSaveAllSettings,
    handleChangeFinanceiroPin,
    refreshSession,
  };
};
