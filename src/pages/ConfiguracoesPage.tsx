
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  HardDrive,
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

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [saving, setSaving] = useState(false);

  // Estado para configurações de perfil
  const [profileSettings, setProfileSettings] = useState({
    name: "Escritório de Advocacia Silva & Associados",
    email: "contato@silvaeassociados.adv.br",
    phone: "(11) 99999-9999",
    oab: "123456/SP",
  });

  // Estado para configurações do escritório
  const [officeSettings, setOfficeSettings] = useState({
    companyName: "Silva & Associados Advocacia",
    cnpj: "12.345.678/0001-90",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    website: "www.silvaeassociados.adv.br",
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

  // Estado para configurações de aparência
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactMode: false,
    fontSize: "medium",
    accentColor: "#9b87f5",
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
            <TabsTrigger value="aparencia" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Sistema
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
          
          {/* Aparência */}
          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Personalização</CardTitle>
                <CardDescription>
                  Customize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o tema escuro para menor fadiga visual
                    </p>
                  </div>
                  <Switch 
                    checked={appearanceSettings.darkMode}
                    onCheckedChange={(checked) => 
                      setAppearanceSettings({...appearanceSettings, darkMode: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz o espaçamento para exibir mais informações
                    </p>
                  </div>
                  <Switch 
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) => 
                      setAppearanceSettings({...appearanceSettings, compactMode: checked})
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Tamanho da Fonte</Label>
                  <div className="flex space-x-2 pt-2">
                    {["small", "medium", "large"].map((size) => (
                      <Button 
                        key={size}
                        variant={appearanceSettings.fontSize === size ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setAppearanceSettings({...appearanceSettings, fontSize: size})}
                      >
                        {size === "small" ? "Pequeno" : size === "medium" ? "Médio" : "Grande"}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {["#9b87f5", "#4F46E5", "#0EA5E9", "#10B981", "#F97316", "#EC4899"].map((color) => (
                      <button
                        key={color}
                        className={`h-8 rounded-full ${appearanceSettings.accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setAppearanceSettings({...appearanceSettings, accentColor: color})}
                        aria-label={`Cor ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sistema */}
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Gerencie o banco de dados e armazenamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Armazenamento</Label>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Uso de armazenamento</span>
                      <span className="text-sm">45% (450 MB / 1 GB)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-[45%] h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>Gerenciamento de Dados</Label>
                  <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
                    <Button variant="outline" className="flex-1">
                      <HardDrive className="mr-2 h-4 w-4" />
                      Backup de Dados
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Database className="mr-2 h-4 w-4" />
                      Restaurar Backup
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Informações do Sistema</Label>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versão</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última atualização</span>
                      <span>15/05/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de instalação</span>
                      <span>01/01/2025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="ml-auto">
                  Verificar atualizações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracoesPage;
