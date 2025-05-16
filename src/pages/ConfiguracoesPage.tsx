
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Save,
  LogOut
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);
  const { user, signOut } = useAuth();
  
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

  // Estado para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Estado para controlar carregamento do botão de senha
  const [changingPassword, setChangingPassword] = useState(false);
  // Estado para controlar o logout
  const [loggingOut, setLoggingOut] = useState(false);

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
  
  const handleChangePassword = async () => {
    // Validações básicas
    if (!passwordData.currentPassword) {
      toast({
        title: "Campo obrigatório",
        description: "Digite sua senha atual.",
        variant: "destructive",
      });
      return;
    }
    
    if (!passwordData.newPassword) {
      toast({
        title: "Campo obrigatório",
        description: "Digite sua nova senha.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Atualizar senha usando a API do Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Limpar campos de senha
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao tentar alterar sua senha.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-gray-600">Personalize o sistema de acordo com suas necessidades</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSignOut} 
              disabled={loggingOut}
            >
              {loggingOut ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sair
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger value="perfil" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="escritorio" className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Escritório
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Perfil */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      value={profileSettings.name}
                      onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oab">Número OAB</Label>
                    <Input 
                      id="oab" 
                      value={profileSettings.oab}
                      onChange={(e) => setProfileSettings({...profileSettings, oab: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escritório */}
          <TabsContent value="escritorio">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Escritório</CardTitle>
                <CardDescription>
                  Configure as informações do seu escritório de advocacia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome do Escritório</Label>
                    <Input 
                      id="companyName" 
                      value={officeSettings.companyName}
                      onChange={(e) => setOfficeSettings({...officeSettings, companyName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      value={officeSettings.cnpj}
                      onChange={(e) => setOfficeSettings({...officeSettings, cnpj: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input 
                      id="address" 
                      value={officeSettings.address}
                      onChange={(e) => setOfficeSettings({...officeSettings, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={officeSettings.website}
                      onChange={(e) => setOfficeSettings({...officeSettings, website: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas no navegador ou aplicativo
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, pushNotifications: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Prazo</Label>
                    <p className="text-sm text-muted-foreground">
                      Seja notificado sobre prazos próximos
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.deadlineAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, deadlineAlerts: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatório Semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo semanal das atividades
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, weeklyReport: checked})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Proteja sua conta e dados do escritório
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticação em Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings.twoFactor}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({...securitySettings, twoFactor: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tempo de Sessão (minutos)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Defina por quanto tempo sua sessão permanecerá ativa sem atividade
                  </p>
                  <Input 
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Restrição de IP</Label>
                    <p className="text-sm text-muted-foreground">
                      Limite o acesso a endereços IP específicos
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({...securitySettings, ipRestriction: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alteração de Senha</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                        Alterando...
                      </>
                    ) : (
                      'Alterar senha'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
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
