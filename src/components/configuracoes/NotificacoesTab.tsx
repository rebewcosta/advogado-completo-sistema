
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
    pref_notificacoes_push: boolean;
    pref_alertas_prazo: boolean;
    pref_relatorio_semanal: boolean;
  };
  setNotificationSettings: React.Dispatch<React.SetStateAction<{
    pref_notificacoes_push: boolean;
    pref_alertas_prazo: boolean;
    pref_relatorio_semanal: boolean;
  }>>;
}

const NotificacoesTab = ({ notificationSettings, setNotificationSettings }: NotificacoesTabProps) => {
  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Preferências de Notificações</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Configure como e quando deseja receber notificações. As alterações são salvas ao clicar em "Salvar alterações" no topo da página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications_config_notif" className="font-medium text-gray-700">Notificações Push (Em breve)</Label>
            <p className="text-xs text-gray-500">
              Receba alertas no navegador ou aplicativo.
            </p>
          </div>
          <Switch 
            id="pushNotifications_config_notif"
            checked={notificationSettings.pref_notificacoes_push}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, pref_notificacoes_push: checked})
            }
            disabled // Funcionalidade de Push Notifications ainda será implementada no backend
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="deadlineAlerts_config_notif" className="font-medium text-gray-700">Alertas de Eventos da Agenda e Prazos</Label>
            <p className="text-xs text-gray-500">
              Seja notificado por email sobre eventos da agenda e prazos importantes.
            </p>
          </div>
          <Switch 
            id="deadlineAlerts_config_notif"
            checked={notificationSettings.pref_alertas_prazo}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, pref_alertas_prazo: checked})
            }
            // Habilitado para permitir que o usuário salve esta preferência
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyReport_config_notif" className="font-medium text-gray-700">Relatório Semanal por Email (Em breve)</Label>
            <p className="text-xs text-gray-500">
              Receba um resumo semanal das atividades do seu escritório.
            </p>
          </div>
          <Switch 
            id="weeklyReport_config_notif"
            checked={notificationSettings.pref_relatorio_semanal}
            onCheckedChange={(checked) => 
              setNotificationSettings({...notificationSettings, pref_relatorio_semanal: checked})
            }
            disabled // Funcionalidade de Relatório Semanal ainda será implementada no backend
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificacoesTab;
