
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface PrazoConfiguracao {
  id?: string;
  dias_alerta_critico: number;
  dias_alerta_urgente: number;
  dias_alerta_medio: number;
  notificacoes_email: boolean;
  notificacoes_sistema: boolean;
}

export const PrazosConfiguracoes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<PrazoConfiguracao>({
    dias_alerta_critico: 3,
    dias_alerta_urgente: 7,
    dias_alerta_medio: 15,
    notificacoes_email: true,
    notificacoes_sistema: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConfiguracoes();
    }
  }, [user]);

  const fetchConfiguracoes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prazo_configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          dias_alerta_critico: data.dias_alerta_critico,
          dias_alerta_urgente: data.dias_alerta_urgente,
          dias_alerta_medio: data.dias_alerta_medio,
          notificacoes_email: data.notificacoes_email,
          notificacoes_sistema: data.notificacoes_sistema,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const dados = {
        user_id: user.id,
        dias_alerta_critico: config.dias_alerta_critico,
        dias_alerta_urgente: config.dias_alerta_urgente,
        dias_alerta_medio: config.dias_alerta_medio,
        notificacoes_email: config.notificacoes_email,
        notificacoes_sistema: config.notificacoes_sistema,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (config.id) {
        // Atualizar configuração existente
        const result = await supabase
          .from('prazo_configuracoes')
          .update(dados)
          .eq('id', config.id);
        error = result.error;
      } else {
        // Criar nova configuração
        const result = await supabase
          .from('prazo_configuracoes')
          .insert(dados)
          .select()
          .single();
        
        error = result.error;
        if (!error && result.data) {
          setConfig(prev => ({ ...prev, id: result.data.id }));
        }
      }

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-64 flex justify-center items-center">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Alertas
          </CardTitle>
          <CardDescription>
            Configure quando e como você quer receber alertas de prazos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuração de Dias */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Antecedência dos Alertas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dias-critico">Alertas Críticos (dias)</Label>
                <Input
                  id="dias-critico"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_critico}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_critico: parseInt(e.target.value) || 3 
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alertas para prazos que vencem em até X dias
                </p>
              </div>

              <div>
                <Label htmlFor="dias-urgente">Alertas Urgentes (dias)</Label>
                <Input
                  id="dias-urgente"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_urgente}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_urgente: parseInt(e.target.value) || 7 
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alertas para prazos que vencem em até X dias
                </p>
              </div>

              <div>
                <Label htmlFor="dias-medio">Alertas Médios (dias)</Label>
                <Input
                  id="dias-medio"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_medio}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_medio: parseInt(e.target.value) || 15 
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alertas para prazos que vencem em até X dias
                </p>
              </div>
            </div>
          </div>

          {/* Configuração de Notificações */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tipos de Notificação</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-sistema">Notificações no Sistema</Label>
                  <p className="text-sm text-gray-500">
                    Exibir alertas no dashboard e na barra lateral
                  </p>
                </div>
                <Switch
                  id="notif-sistema"
                  checked={config.notificacoes_sistema}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev, 
                    notificacoes_sistema: checked 
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notif-email">Notificações por Email</Label>
                  <p className="text-sm text-gray-500">
                    Receber emails quando novos alertas forem gerados
                  </p>
                </div>
                <Switch
                  id="notif-email"
                  checked={config.notificacoes_email}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev, 
                    notificacoes_email: checked 
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={salvarConfiguracoes} disabled={isSaving}>
              {isSaving ? (
                <Spinner />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Alertas Automáticos:</strong> O sistema verifica automaticamente todos os seus processos e eventos da agenda.</p>
            <p><strong>Níveis de Criticidade:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• <span className="text-red-600 font-medium">Crítico</span>: Prazos que vencem em até {config.dias_alerta_critico} dias</li>
              <li>• <span className="text-orange-600 font-medium">Urgente</span>: Prazos que vencem em até {config.dias_alerta_urgente} dias</li>
              <li>• <span className="text-yellow-600 font-medium">Médio</span>: Prazos que vencem em até {config.dias_alerta_medio} dias</li>
            </ul>
            <p><strong>Fontes de Dados:</strong> Processos com "próximo prazo" preenchido e eventos da agenda.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
