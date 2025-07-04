
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserMonitoringCard from './UserMonitoringCard';
import ErrorLogsTable from './ErrorLogsTable';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Users,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface SystemStatus {
  status: 'operational' | 'degraded' | 'down';
  lastCheck: string;
  responseTime: number;
}

interface UserProfile {
  id: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  oab: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

interface ErrorLog {
  id: string;
  user_id: string | null;
  error_type: string;
  error_message: string;
  component_name: string | null;
  url: string | null;
  timestamp: string;
  severity: 'error' | 'warning' | 'info';
  resolved: boolean;
}

interface SystemMetrics {
  totalUsers: number;
  onlineUsers: number;
  recentErrors: number;
  unresolvedErrors: number;
}

const SystemMonitoring = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'operational',
    lastCheck: new Date().toISOString(),
    responseTime: 120
  });
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    onlineUsers: 0,
    recentErrors: 0,
    unresolvedErrors: 0
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) throw error;
      
      setUsers(usersData || []);
      
      const onlineCount = usersData?.filter(user => user.is_online).length || 0;
      setMetrics(prev => ({
        ...prev,
        totalUsers: usersData?.length || 0,
        onlineUsers: onlineCount
      }));

    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados dos usuários.",
        variant: "destructive"
      });
    }
  };

  const fetchErrors = async () => {
    try {
      const { data: errorsData, error } = await supabase
        .from('system_error_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setErrors(errorsData || []);
      
      const recent24h = errorsData?.filter(error => {
        const errorDate = new Date(error.timestamp);
        const now = new Date();
        const timeDiff = now.getTime() - errorDate.getTime();
        return timeDiff < 24 * 60 * 60 * 1000; // 24 horas
      }).length || 0;
      
      const unresolved = errorsData?.filter(error => !error.resolved).length || 0;
      
      setMetrics(prev => ({
        ...prev,
        recentErrors: recent24h,
        unresolvedErrors: unresolved
      }));

    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de erro.",
        variant: "destructive"
      });
    }
  };

  const markErrorAsResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('system_error_logs')
        .update({ resolved: true })
        .eq('id', errorId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Erro marcado como resolvido.",
      });
      
      fetchErrors(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao marcar como resolvido:', error);
      toast({
        title: "Erro",
        description: "Falha ao marcar erro como resolvido.",
        variant: "destructive"
      });
    }
  };

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    
    try {
      // Teste simples de conectividade
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        setSystemStatus({
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime
        });
      } else {
        setSystemStatus({
          status: 'operational',
          lastCheck: new Date().toISOString(),
          responseTime
        });
      }

      // Atualizar todos os dados
      await Promise.all([fetchUsers(), fetchErrors()]);

    } catch (error: any) {
      setSystemStatus({
        status: 'down',
        lastCheck: new Date().toISOString(),
        responseTime: Date.now() - startTime
      });
      
      console.error('Erro na verificação do sistema:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Marcar usuários como offline se não ativos há mais de 5 minutos
  const updateOfflineUsers = async () => {
    try {
      await supabase.rpc('mark_users_offline');
      fetchUsers(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao atualizar usuários offline:', error);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(() => {
      updateOfflineUsers();
      fetchUsers();
      fetchErrors();
    }, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const onlineUsers = users.filter(user => user.is_online);
  const offlineUsers = users.filter(user => !user.is_online);

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(systemStatus.status)}>
                {getStatusIcon(systemStatus.status)}
                <span className="ml-1 capitalize">{systemStatus.status}</span>
              </Badge>
              <span className="text-sm text-gray-500">
                Tempo de resposta: {systemStatus.responseTime}ms
              </span>
            </div>
            <Button
              onClick={checkSystemHealth}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Última verificação: {new Date(systemStatus.lastCheck).toLocaleString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de Usuários</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Usuários Online</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{metrics.onlineUsers}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Erros (24h)</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{metrics.recentErrors}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Não Resolvidos</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{metrics.unresolvedErrors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Monitoramento */}
      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="online">Usuários Online ({metrics.onlineUsers})</TabsTrigger>
          <TabsTrigger value="all">Todos os Usuários ({metrics.totalUsers})</TabsTrigger>
          <TabsTrigger value="errors">Erros do Sistema ({metrics.recentErrors})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="online" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineUsers.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                Nenhum usuário online no momento
              </p>
            ) : (
              onlineUsers.map((user) => (
                <UserMonitoringCard key={user.id} user={user} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">
                Nenhum usuário encontrado
              </p>
            ) : (
              users.map((user) => (
                <UserMonitoringCard key={user.id} user={user} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="errors">
          <ErrorLogsTable 
            errors={errors} 
            onMarkResolved={markErrorAsResolved}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring;
