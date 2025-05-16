// Caminho: advogado-completo-sistema-main/src/pages/ConfiguracoesPage.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

// Componentes de Configurações
import ConfiguracoesHeader from '@/components/configuracoes/ConfiguracoesHeader';
import PerfilTab from '@/components/configuracoes/PerfilTab';
import EscritorioTab from '@/components/configuracoes/EscritorioTab';
import NotificacoesTab from '@/components/configuracoes/NotificacoesTab';
import SegurancaTab from '@/components/configuracoes/SegurancaTab';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';

// Componentes UI do ShadCN - IMPORTAÇÕES ADICIONADAS/VERIFICADAS
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // <--- IMPORTANTE!
import { Button } from '@/components/ui/button'; // Já deve existir
import { Input } from '@/components/ui/input';   // Já deve existir
import { Label } from '@/components/ui/label';   // Já deve existir
import { Spinner } from '@/components/ui/spinner'; // Já deve existir
import { User, Building, Bell, Shield, CreditCard } from 'lucide-react';

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);
  const { user, signOut, refreshSession } = useAuth();
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
        data: {
          nome: profileSettings.name,
          telefone: profileSettings.phone,
          oab: profileSettings.oab,
          empresa: officeSettings.companyName,
          cnpj: officeSettings.cnpj,
          endereco: officeSettings.address,
          website: officeSettings.website,
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
      <div className="p-4 md:p-6 lg:p-8">
        <ConfiguracoesHeader
          saving={saving}
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
            {/* Aqui usamos os componentes Card que foram importados */}
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