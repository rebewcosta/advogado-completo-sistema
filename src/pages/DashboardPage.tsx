
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, DollarSign, FileText, Users, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  
  // Obter o primeiro nome do usuário dos metadados ou do email
  const getUserFirstName = () => {
    if (user?.user_metadata?.nome) {
      const fullName = user.user_metadata.nome;
      return fullName.split(' ')[0]; // Retorna apenas o primeiro nome
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-3 md:p-6">
        <div className={`flex items-center justify-between mb-4 ${isMobile ? 'flex-col items-start gap-2' : ''}`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">
              Bem-vindo(a), {getUserFirstName()}. {!isMobile && "Aqui está o resumo do seu escritório."}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        <Tabs defaultValue="visao-geral" className="space-y-4">
          <TabsList className="mb-4 w-full flex justify-between">
            <TabsTrigger value="visao-geral" className="flex-1">Visão Geral</TabsTrigger>
            <TabsTrigger value="financeiro" className="flex-1">Financeiro</TabsTrigger>
            <TabsTrigger value="processos" className="flex-1">Processos</TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Nenhum cliente cadastrado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processos em Andamento</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Nenhum processo cadastrado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Nenhum compromisso agendado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita no Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">
                    Nenhum recebimento registrado
                  </p>
                </CardContent>
              </Card>
            </div>

            {!isMobile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Audiências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma audiência agendada
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prazos Próximos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum prazo cadastrado
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {isMobile && (
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Audiências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma audiência agendada
                  </div>
                </CardContent>
              </Card>
            )}

            {!isMobile && (
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade registrada
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Conteúdo da aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 md:py-8 text-muted-foreground">
                  Nenhuma transação registrada
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Processos */}
          <TabsContent value="processos" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Processos por Status</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? "h-48" : "h-80"}>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum processo cadastrado
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audiências por Mês</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? "h-48" : "h-80"}>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma audiência agendada
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processos por Área</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? "h-48" : "h-80"}>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum processo cadastrado
                  </div>
                </CardContent>
              </Card>
            </div>

            {!isMobile && (
              <Card>
                <CardHeader>
                  <CardTitle>Últimos Processos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum processo cadastrado
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
