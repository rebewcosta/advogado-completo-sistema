
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const ConfiguracoesPage = () => {
  const { toast } = useToast();
  const [notificacaoEvento, setNotificacaoEvento] = useState(true);
  const [notificacaoPrazo, setNotificacaoPrazo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Função para salvar as configurações
  const salvarConfiguracoes = () => {
    setIsLoading(true);
    
    // Simulação de salvamento (aqui você adicionaria a lógica real)
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Configurações</h1>
        
        <Tabs defaultValue="notificacoes" className="w-full">
          <TabsList className="w-full md:w-auto mb-4">
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Geral</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Conteúdo da aba de Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Notificações no Sistema</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacao-evento">Eventos da agenda</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre eventos próximos na agenda.
                      </p>
                    </div>
                    <Switch 
                      id="notificacao-evento" 
                      checked={notificacaoEvento}
                      onCheckedChange={setNotificacaoEvento}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificacao-prazo">Prazos processuais</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações sobre prazos próximos.
                      </p>
                    </div>
                    <Switch 
                      id="notificacao-prazo" 
                      checked={notificacaoPrazo}
                      onCheckedChange={setNotificacaoPrazo}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={salvarConfiguracoes} 
                  className="mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Salvar configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Conteúdo da aba Geral */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as preferências gerais do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground py-4">
                  Configurações gerais estarão disponíveis em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracoesPage;
