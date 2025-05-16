
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface NotificacoesTabProps {
  notificationSettings: {
    pushNotifications: boolean;
    deadlineAlerts: boolean;
    weeklyReport: boolean;
  };
  setNotificationSettings: React.Dispatch<React.SetStateAction<{
    pushNotifications: boolean;
    deadlineAlerts: boolean;
    weeklyReport: boolean;
  }>>;
}

const NotificacoesTab = ({ notificationSettings, setNotificationSettings }: NotificacoesTabProps) => {
  return (
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
  );
};

export default NotificacoesTab;
