
// src/components/configuracoes/NotificacoesTab.tsx
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

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
  const { toast } = useToast();
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    // Verificar se notificações são suportadas
    if ('Notification' in window) {
      setIsNotificationSupported(true);
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!isNotificationSupported) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive"
      });
      return;
    }

    setIsRequestingPermission(true);
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationSettings({
          ...notificationSettings, 
          pref_notificacoes_push: true
        });
        
        // Enviar notificação de teste
        new Notification('JusGestão - Notificações Ativadas!', {
          body: 'Você receberá notificações sobre eventos importantes da sua agenda.',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png'
        });
        
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá alertas sobre eventos importantes.",
        });
      } else if (permission === 'denied') {
        setNotificationSettings({
          ...notificationSettings, 
          pref_notificacoes_push: false
        });
        toast({
          title: "Permissão negada",
          description: "Para ativar as notificações, permita nas configurações do navegador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar permissão para notificações.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const testNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('JusGestão - Teste de Notificação', {
        body: 'Esta é uma notificação de teste do seu sistema JusGestão.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png'
      });
      toast({
        title: "Notificação enviada!",
        description: "Verifique se a notificação apareceu no seu dispositivo.",
      });
    }
  };

  const getNotificationStatus = () => {
    if (!isNotificationSupported) {
      return { icon: AlertCircle, text: "Não suportado neste navegador", color: "text-red-600" };
    }
    
    switch (notificationPermission) {
      case 'granted':
        return { icon: CheckCircle, text: "Ativadas", color: "text-green-600" };
      case 'denied':
        return { icon: AlertCircle, text: "Bloqueadas", color: "text-red-600" };
      default:
        return { icon: Bell, text: "Aguardando permissão", color: "text-yellow-600" };
    }
  };

  const status = getNotificationStatus();

  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Preferências de Notificações</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Configure como e quando deseja receber notificações. As alterações são salvas ao clicar em "Salvar alterações" no topo da página.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications_config_notif" className="font-medium text-gray-700">
                Notificações Push do Navegador
              </Label>
              <p className="text-xs text-gray-500">
                Receba alertas instantâneos no navegador ou aplicativo sobre eventos importantes.
              </p>
            </div>
            <Switch 
              id="pushNotifications_config_notif"
              checked={notificationSettings.pref_notificacoes_push && notificationPermission === 'granted'}
              onCheckedChange={(checked) => {
                if (checked && notificationPermission !== 'granted') {
                  requestNotificationPermission();
                } else {
                  setNotificationSettings({...notificationSettings, pref_notificacoes_push: checked});
                }
              }}
              disabled={isRequestingPermission || !isNotificationSupported}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <status.icon className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>
                Status: {status.text}
              </span>
            </div>
            
            {notificationPermission === 'granted' && notificationSettings.pref_notificacoes_push && (
              <Button
                onClick={testNotification}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Testar Notificação
              </Button>
            )}
            
            {notificationPermission === 'default' && (
              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isRequestingPermission}
              >
                {isRequestingPermission ? 'Solicitando...' : 'Ativar'}
              </Button>
            )}
          </div>
          
          {notificationPermission === 'denied' && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              Para ativar as notificações, acesse as configurações do seu navegador e permita notificações para este site.
            </div>
          )}
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
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificacoesTab;
