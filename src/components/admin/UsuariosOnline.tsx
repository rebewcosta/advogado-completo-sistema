import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wifi, 
  WifiOff, 
  UserCheck, 
  RefreshCw,
  Activity 
} from 'lucide-react';

interface OnlineUser {
  id: string;
  email: string;
  nome_completo?: string;
  last_seen: string;
  is_online: boolean;
}

const UsuariosOnline = () => {
  const [databaseOnlineUsers, setDatabaseOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { onlineUsers: realtimeUsers, onlineCount: realtimeCount, isConnected } = useRealtimePresence();

  const fetchOnlineUsersFromDatabase = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_online', true)
        .order('last_seen', { ascending: false });

      if (error) throw error;

      const onlineUsers = data?.map(profile => ({
        id: profile.id,
        email: profile.email || `user_${profile.id.substring(0, 8)}`,
        nome_completo: profile.nome_completo,
        last_seen: profile.last_seen || new Date().toISOString(),
        is_online: profile.is_online
      })) || [];

      setDatabaseOnlineUsers(onlineUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários online:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markUsersOffline = async () => {
    try {
      await supabase.functions.invoke('mark-users-offline');
      await fetchOnlineUsersFromDatabase();
    } catch (error) {
      console.error('Erro ao marcar usuários offline:', error);
    }
  };

  useEffect(() => {
    fetchOnlineUsersFromDatabase();
    
    // Atualizar a cada 30 segundos para melhor detecção
    const interval = setInterval(fetchOnlineUsersFromDatabase, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Usuários Online */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span className="text-sm font-medium">Tempo Real</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{realtimeCount}</p>
                <p className="text-xs text-gray-500">
                  {isConnected ? 'Conectado via WebSocket' : 'Reconectando...'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Base de Dados</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{databaseOnlineUsers.length}</p>
            <p className="text-xs text-gray-500">Usuários marcados como online</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Controles</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={fetchOnlineUsersFromDatabase}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  onClick={markUsersOffline}
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                >
                  Limpar Offline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duas seções: Tempo Real e Base de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários Online em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              Tempo Real ({realtimeCount})
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Status:</strong> {isConnected ? 'Conectado via WebSocket' : 'Reconectando...'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Dados atualizados instantaneamente
              </p>
            </div>
            
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {realtimeUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {isConnected ? 'Nenhum usuário online via WebSocket' : 'Conectando...'}
                  </p>
                ) : (
                  realtimeUsers.map((user, index) => (
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

        {/* Usuários Online na Base de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Base de Dados ({databaseOnlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Fonte:</strong> Tabela user_profiles
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Usuários marcados como online (is_online = true)
              </p>
            </div>
            
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {databaseOnlineUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {isLoading ? 'Carregando...' : 'Nenhum usuário online na base de dados'}
                  </p>
                ) : (
                  databaseOnlineUsers.map((user, index) => (
                    <div key={user.id} className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.nome_completo && (
                              <p className="text-sm text-gray-600">{user.nome_completo}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                            Online
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Visto: {formatLastSeen(user.last_seen)}
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
      </div>
    </div>
  );
};

export default UsuariosOnline;