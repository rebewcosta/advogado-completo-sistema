
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, RotateCcw, Bell, Mail, Monitor, Info } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';

interface PrazoConfiguracao {
  id?: string;
  dias_alerta_critico: number;
  dias_alerta_urgente: number;
  dias_alerta_medio: number;
  notificacoes_email: boolean;
  notificacoes_sistema: boolean;
}

const configuracaoPadrao: PrazoConfiguracao = {
  dias_alerta_critico: 3,
  dias_alerta_urgente: 7,
  dias_alerta_medio: 15,
  notificacoes_email: true,
  notificacoes_sistema: true,
};

export const PrazosConfiguracoes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<PrazoConfiguracao>(configuracaoPadrao);
  const [configOriginal, setConfigOriginal] = useState<PrazoConfiguracao>(configuracaoPadrao);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConfiguracoes();
    }
  }, [user]);

  useEffect(() => {
    // Verificar se há mudanças
    const mudancas = JSON.stringify(config) !== JSON.stringify(configOriginal);
    setHasChanges(mudancas);
  }, [config, configOriginal]);

  const fetchConfiguracoes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prazo_configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const configCarregada = data ? {
        id: data.id,
        dias_alerta_critico: data.dias_alerta_critico,
        dias_alerta_urgente: data.dias_alerta_urgente,
        dias_alerta_medio: data.dias_alerta_medio,
        notificacoes_email: data.notificacoes_email,
        notificacoes_sistema: data.notificacoes_sistema,
      } : configuracaoPadrao;

      setConfig(configCarregada);
      setConfigOriginal(configCarregada);
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive",
      });
      // Usar configuração padrão em caso de erro
      setConfig(configuracaoPadrao);
      setConfigOriginal(configuracaoPadrao);
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    if (!user) return;

    // Validar configurações
    if (config.dias_alerta_critico < 1 || config.dias_alerta_critico > 30) {
      toast({
        title: "Configuração inválida",
        description: "Dias para alertas críticos deve estar entre 1 e 30.",
        variant: "destructive",
      });
      return;
    }

    if (config.dias_alerta_urgente < 1 || config.dias_alerta_urgente > 30) {
      toast({
        title: "Configuração inválida",
        description: "Dias para alertas urgentes deve estar entre 1 e 30.",
        variant: "destructive",
      });
      return;
    }

    if (config.dias_alerta_medio < 1 || config.dias_alerta_medio > 30) {
      toast({
        title: "Configuração inválida",
        description: "Dias para alertas médios deve estar entre 1 e 30.",
        variant: "destructive",
      });
      return;
    }

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

      // Atualizar estado original
      setConfigOriginal({ ...config });

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetarConfiguracoes = () => {
    setConfig({ ...configOriginal });
  };

  const restaurarPadrao = () => {
    setConfig({ ...configuracaoPadrao, id: config.id });
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
          {/* Indicador de mudanças */}
          {hasChanges && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Você tem alterações não salvas</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetarConfiguracoes}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Desfazer
                </Button>
                <Button size="sm" onClick={salvarConfiguracoes} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          )}

          {/* Configuração de Dias */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Antecedência dos Alertas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dias-critico" className="text-sm font-medium">
                  Alertas Críticos (dias)
                </Label>
                <Input
                  id="dias-critico"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_critico}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_critico: parseInt(e.target.value) || 1 
                  }))}
                  className="border-red-200 focus:border-red-400"
                />
                <p className="text-xs text-gray-500">
                  Alertas para prazos que vencem em até {config.dias_alerta_critico} {config.dias_alerta_critico === 1 ? 'dia' : 'dias'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dias-urgente" className="text-sm font-medium">
                  Alertas Urgentes (dias)
                </Label>
                <Input
                  id="dias-urgente"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_urgente}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_urgente: parseInt(e.target.value) || 1 
                  }))}
                  className="border-orange-200 focus:border-orange-400"
                />
                <p className="text-xs text-gray-500">
                  Alertas para prazos que vencem em até {config.dias_alerta_urgente} {config.dias_alerta_urgente === 1 ? 'dia' : 'dias'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dias-medio" className="text-sm font-medium">
                  Alertas Médios (dias)
                </Label>
                <Input
                  id="dias-medio"
                  type="number"
                  min="1"
                  max="30"
                  value={config.dias_alerta_medio}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    dias_alerta_medio: parseInt(e.target.value) || 1 
                  }))}
                  className="border-yellow-200 focus:border-yellow-400"
                />
                <p className="text-xs text-gray-500">
                  Alertas para prazos que vencem em até {config.dias_alerta_medio} {config.dias_alerta_medio === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuração de Notificações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium">Tipos de Notificação</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="notif-sistema" className="text-sm font-medium">
                      Notificações no Sistema
                    </Label>
                    <p className="text-sm text-gray-500">
                      Exibir alertas no dashboard e na barra lateral
                    </p>
                  </div>
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

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label htmlFor="notif-email" className="text-sm font-medium">
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receber emails quando novos alertas forem gerados
                    </p>
                  </div>
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

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={restaurarPadrao}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrão
            </Button>
            <Button onClick={salvarConfiguracoes} disabled={isSaving || !hasChanges}>
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
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-3">
            <div>
              <p className="font-medium mb-2">Alertas Automáticos:</p>
              <p className="text-gray-600">
                O sistema verifica automaticamente todos os seus processos e eventos da agenda, 
                gerando alertas baseados nas configurações definidas acima.
              </p>
            </div>
            
            <div>
              <p className="font-medium mb-2">Níveis de Criticidade:</p>
              <ul className="ml-4 space-y-1 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="font-medium text-red-600">Crítico</span>: 
                  Prazos que vencem em até {config.dias_alerta_critico} {config.dias_alerta_critico === 1 ? 'dia' : 'dias'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="font-medium text-orange-600">Urgente</span>: 
                  Prazos que vencem em até {config.dias_alerta_urgente} {config.dias_alerta_urgente === 1 ? 'dia' : 'dias'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="font-medium text-yellow-600">Médio</span>: 
                  Prazos que vencem em até {config.dias_alerta_medio} {config.dias_alerta_medio === 1 ? 'dia' : 'dias'}
                </li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">Fontes de Dados:</p>
              <ul className="ml-4 space-y-1 text-gray-600">
                <li>• Processos com "próximo prazo" preenchido</li>
                <li>• Eventos da agenda com datas futuras</li>
                <li>• Tarefas com prazos definidos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
