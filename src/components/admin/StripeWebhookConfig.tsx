
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink, Copy, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StripeWebhookConfig = () => {
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'configured' | 'missing'>('checking');
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const checkWebhookConfiguration = () => {
      // URL do webhook baseada no ambiente
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'https://lqprcsquknlegzmzdoct.supabase.co'
        : 'https://lqprcsquknlegzmzdoct.supabase.co';
      
      const webhookEndpoint = `${baseUrl}/functions/v1/webhook-stripe`;
      setWebhookUrl(webhookEndpoint);
      
      // Simular verificação (em produção, isso seria uma chamada real)
      setTimeout(() => {
        setWebhookStatus('missing'); // Para mostrar as instruções inicialmente
      }, 1000);
    };

    checkWebhookConfiguration();
  }, []);

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada!",
      description: "URL do webhook copiada para a área de transferência.",
    });
  };

  const requiredEvents = [
    'customer.subscription.created',
    'customer.subscription.updated', 
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Webhook Stripe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status atual */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          {webhookStatus === 'checking' && (
            <Badge variant="secondary">Verificando...</Badge>
          )}
          {webhookStatus === 'configured' && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          )}
          {webhookStatus === 'missing' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Configuração Necessária
            </Badge>
          )}
        </div>

        {/* Instruções de configuração */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuração Manual Obrigatória:</strong> Configure o webhook no Dashboard do Stripe para ativar os pagamentos automáticos.
          </AlertDescription>
        </Alert>

        {/* URL do Webhook */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL do Webhook:</label>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
            <code className="flex-1 text-sm font-mono">{webhookUrl}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyWebhookUrl}
              className="h-8"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Eventos necessários */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Eventos Obrigatórios:</label>
          <div className="grid grid-cols-1 gap-1">
            {requiredEvents.map((event) => (
              <code key={event} className="text-xs bg-gray-100 p-1 rounded">
                {event}
              </code>
            ))}
          </div>
        </div>

        {/* Instruções passo a passo */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Passos para Configuração:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Acesse o <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Dashboard do Stripe <ExternalLink className="h-3 w-3" /></a></li>
            <li>Clique em "Add endpoint"</li>
            <li>Cole a URL do webhook acima</li>
            <li>Selecione os eventos listados acima</li>
            <li>Salve e ative o webhook</li>
          </ol>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4">
          <Button 
            asChild
            className="flex-1"
          >
            <a 
              href="https://dashboard.stripe.com/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Dashboard Stripe
            </a>
          </Button>
          <Button 
            variant="outline"
            onClick={() => setWebhookStatus('configured')}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como Configurado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeWebhookConfig;
