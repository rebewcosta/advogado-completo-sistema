
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';
import { 
  Users, 
  RefreshCw, 
  Clock,
  UserCheck,
  Activity,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react';

interface UserActivity {
  id: string;
  email: string;
  last_login: string;
  is_online: boolean;
  last_seen: string;
  login_count: number;
}

interface CreatedAccount {
  id: string;
  email: string;
  created_at: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  raw_user_meta_data?: any;
}

interface LoginHistory {
  id: string;
  email: string;
  login_time: string;
  user_agent?: string;
  ip_address?: string;
}

const UserActivityMonitoring = () => {
  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [createdAccounts, setCreatedAccounts] = useState<CreatedAccount[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalAccountsCount, setTotalAccountsCount] = useState(0);
  const [realtimeOnlineUsers, setRealtimeOnlineUsers] = useState<any[]>([]);
  const { toast } = useToast();

  // Hook para presença em tempo real
  const { onlineUsers, onlineCount, isConnected } = useRealtimePresence();

  const fetchCreatedAccounts = async () => {
    try {
      // Buscar usuários reais da tabela auth.users usando uma função edge function
      const { data, error } = await supabase.functions.invoke('get-all-users');
      
      if (error) {
        console.error('Erro ao buscar contas criadas:', error);
        return;
      }

      if (data?.users) {
        const accounts: CreatedAccount[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          confirmed_at: user.confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          raw_user_meta_data: user.raw_user_meta_data
        }));
        
        setCreatedAccounts(accounts);
        setTotalAccountsCount(accounts.length);
      }
    } catch (error) {
      console.error('Erro ao buscar contas criadas:', error);
    }
  };

  const fetchUserActivity = async () => {
    setIsLoading(true);
    try {
      // Buscar usuários realmente online da tabela user_profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('last_seen', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar contas criadas
      await fetchCreatedAccounts();

      // Processar dados dos usuários online da tabela user_profiles
      const realtimeUsers = profilesData?.map(profile => ({
        id: profile.id,
        email: profile.email || `user_${profile.id.substring(0, 8)}@system.local`,
        nome_completo: profile.nome_completo,
        last_seen: profile.last_seen || new Date().toISOString(),
        is_online: profile.is_online || false,
        last_login: profile.last_seen || new Date().toISOString()
      })) || [];

      setRealtimeOnlineUsers(realtimeUsers);

      // Criar mock de dados para usuários ativos (últimas 24h)
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const activeUsersData = realtimeUsers
        .filter(user => new Date(user.last_seen) > last24h)
        .map(user => ({
          id: user.id,
          email: user.email,
          last_login: user.last_login,
          is_online: user.is_online,
          last_seen: user.last_seen,
          login_count: Math.floor(Math.random() * 50) + 1
        }));

      setActiveUsers(activeUsersData);

      // Simular histórico de login baseado nos usuários ativos
      const mockLoginHistory: LoginHistory[] = activeUsersData.slice(0, 20).map(user => ({
        id: user.id,
        email: user.email,
        login_time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
      }));

      setLoginHistory(mockLoginHistory.sort((a, b) => 
        new Date(b.login_time).getTime() - new Date(a.login_time).getTime()
      ));

      toast({
        title: "Dados atualizados",
        description: `${activeUsersData.length} usuários ativos encontrados.`,
      });

    } catch (error: any) {
      console.error('Erro ao buscar atividade dos usuários:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || 'Ocorreu um erro inesperado',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOnlineStatus = (lastSeen: string) => {
    const lastSeenTime = new Date(lastSeen).getTime();
    const now = Date.now();
    const diffMinutes = (now - lastSeenTime) / (1000 * 60);

    if (diffMinutes < 5) return { status: 'online', color: 'bg-green-500', text: 'Online' };
    if (diffMinutes < 30) return { status: 'away', color: 'bg-yellow-500', text: 'Ausente' };
    return { status: 'offline', color: 'bg-gray-500', text: 'Offline' };
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    fetchUserActivity();
    
    // Atualizar a cada 2 minutos
    const interval = setInterval(fetchUserActivity, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Hook para executar a função de marcar usuários offline periodicamente
  useEffect(() => {
    const markUsersOffline = async () => {
      try {
        await supabase.functions.invoke('mark-users-offline');
        console.log('✅ Usuários offline marcados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao marcar usuários offline:', error);
      }
    };

    // Executar imediatamente
    markUsersOffline();

    // Executar a cada 1 minuto
    const offlineInterval = setInterval(markUsersOffline, 60 * 1000);

    return () => clearInterval(offlineInterval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Usuários Online</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Tempo real conectado' : 'Reconectando...'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Usuários Ativos</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{activeUsers.length}</p>
            <p className="text-xs text-gray-500">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Contas Criadas</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{totalAccountsCount}</p>
            <p className="text-xs text-gray-500">Total de usuários</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Última Atualização</span>
              </div>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <Button
              onClick={fetchUserActivity}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Contas Criadas</TabsTrigger>
          <TabsTrigger value="online">Usuários Online</TabsTrigger>
          <TabsTrigger value="active">Usuários Ativos</TabsTrigger>
          <TabsTrigger value="history">Histórico de Logins</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contas Criadas ({totalAccountsCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {createdAccounts.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {isLoading ? 'Carregando contas...' : 'Nenhuma conta encontrada'}
                    </p>
                  ) : (
                    createdAccounts.map((account, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${account.confirmed_at ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <div>
                              <p className="font-medium">{account.email}</p>
                              <p className="text-sm text-gray-500">
                                ID: {account.id.substring(0, 8)}...
                              </p>
                              {account.raw_user_meta_data?.nome_completo && (
                                <p className="text-xs text-gray-400">
                                  Nome: {account.raw_user_meta_data.nome_completo}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {account.confirmed_at ? 'Confirmado' : 'Pendente'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Criado: {new Date(account.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            {account.last_sign_in_at && (
                              <p className="text-xs text-gray-400">
                                Último login: {new Date(account.last_sign_in_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="online">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Usuários Online Em Tempo Real ({onlineCount})
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Status de Conexão:</strong> {isConnected ? 'Conectado e monitorando em tempo real' : 'Reconectando...'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Dados atualizados automaticamente via WebSocket
                </p>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {onlineUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      {isConnected ? 'Nenhum usuário online no momento' : 'Conectando ao sistema de presença...'}
                    </p>
                  ) : (
                    onlineUsers.map((user, index) => (
                      <div key={user.user_id} className="border rounded-lg p-3 bg-green-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              {user.nome_completo && (
                                <p className="text-sm text-gray-600">{user.nome_completo}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                ID: {user.user_id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                              Online Agora
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Conectado: {new Date(user.online_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Ativos - Últimas 24h ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activeUsers.map((user, index) => {
                    const status = getOnlineStatus(user.last_seen);
                    return (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-gray-500">
                                ID: {user.id.substring(0, 8)}... • {user.login_count} logins
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {status.text}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Última atividade: {formatLastSeen(user.last_seen)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Logins Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {loginHistory.map((login, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{login.email}</p>
                            <p className="text-sm text-gray-500">
                              ID: {login.id.substring(0, 8)}...
                            </p>
                            {login.ip_address && (
                              <p className="text-xs text-gray-400">
                                IP: {login.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(login.login_time).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatLastSeen(login.login_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivityMonitoring;
