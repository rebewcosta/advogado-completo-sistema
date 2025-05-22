// src/components/configuracoes/NotificacoesTab.tsx
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
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Preferências de Notificações</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Configure como e quando deseja receber notificações. <span className="text-blue-600">(Funcionalidades futuras)</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications_config_notif" className="font-medium text-gray-700">Notificações Push</Label>
            <p className="text-xs text-gray-500">
              Receba alertas no navegador ou aplicativo.
            </p>
          </div>
          <Switch 
            id="pushNotifications_config_notif"
            checked={notificationSettings.pushNotifications}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, pushNotifications: checked})
            }
            disabled // Funcionalidade futura
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="deadlineAlerts_config_notif" className="font-medium text-gray-700">Alertas de Prazo</Label>
            <p className="text-xs text-gray-500">
              Seja notificado sobre prazos importantes que estão próximos.
            </p>
          </div>
          <Switch 
            id="deadlineAlerts_config_notif"
            checked={notificationSettings.deadlineAlerts}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, deadlineAlerts: checked})
            }
            disabled // Funcionalidade futura
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyReport_config_notif" className="font-medium text-gray-700">Relatório Semanal por Email</Label>
            <p className="text-xs text-gray-500">
              Receba um resumo semanal das atividades do seu escritório.
            </p>
          </div>
          <Switch 
            id="weeklyReport_config_notif"
            checked={notificationSettings.weeklyReport}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, weeklyReport: checked})
            }
            disabled // Funcionalidade futura
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificacoesTab;