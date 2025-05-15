
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Save
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

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  
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
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    deadlineAlerts: true,
    weeklyReport: true,
  });

  // Estado para configurações de segurança
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    ipRestriction: false,
  });

  const handleSave = () => {
    setSaving(true);
    
    // Simulando salvamento
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-gray-600">Personalize o sistema de acordo com suas necessidades</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar alterações
          </Button>
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
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas e relatórios por e-mail
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emailNotifications: checked})
                    }
                  />
                </div>
                
                <Separator />
                
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
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas por mensagem de texto
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, smsNotifications: checked})
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
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full md:w-auto">
                    Alterar senha
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
