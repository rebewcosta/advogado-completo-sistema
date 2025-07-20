import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';

interface TrialUser {
  id: string;
  email: string;
  created_at: string;
  trial_expires_at?: string;
  custom_trial_expiration?: string;
  days_remaining: number;
  status: 'active' | 'expired' | 'expiring_soon';
  subscription_status?: string;
  special_access?: boolean;
}

const UsuariosTrial = () => {
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [customDate, setCustomDate] = useState('');
  const { toast } = useToast();

  const fetchTrialUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { action: 'list_trial_users' }
      });

      if (error) throw error;

      if (data?.success && data?.trial_users) {
        setTrialUsers(data.trial_users);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários trial:', error);
      toast({
        title: "Erro ao carregar usuários trial",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setCustomExpiration = async () => {
    if (!selectedUser || !customDate) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e uma data válida",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { 
          action: 'set_trial_expiration',
          user_id: selectedUser,
          expiration_date: customDate
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Sucesso",
          description: "Data de expiração personalizada definida",
        });
        fetchTrialUsers();
        setSelectedUser('');
        setCustomDate('');
      }
    } catch (error: any) {
      console.error('Erro ao definir expiração personalizada:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeCustomExpiration = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { 
          action: 'remove_custom_expiration',
          user_id: userId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Sucesso",
          description: "Expiração personalizada removida, voltando ao padrão de 7 dias",
        });
        fetchTrialUsers();
      }
    } catch (error: any) {
      console.error('Erro ao remover expiração personalizada:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTrialUsers();
  }, []);

  const getStatusBadge = (user: TrialUser) => {
    if (user.special_access) {
      return <Badge className="bg-purple-500 text-white">Acesso Especial</Badge>;
    }
    
    if (user.subscription_status === 'active') {
      return <Badge className="bg-green-500 text-white">Assinante Ativo</Badge>;
    }

    if (user.status === 'expired') {
      return <Badge className="bg-red-500 text-white">Trial Expirado</Badge>;
    }
    
    if (user.status === 'expiring_soon') {
      return <Badge className="bg-yellow-500 text-white">Expirando em Breve</Badge>;
    }
    
    return <Badge className="bg-blue-500 text-white">Trial Ativo</Badge>;
  };

  const getStatusIcon = (user: TrialUser) => {
    if (user.special_access) {
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    }
    
    if (user.subscription_status === 'active') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (user.status === 'expired') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (user.status === 'expiring_soon') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <Timer className="h-4 w-4 text-blue-500" />;
  };

  const activeTrials = trialUsers.filter(u => u.status === 'active');
  const expiringTrials = trialUsers.filter(u => u.status === 'expiring_soon');
  const expiredTrials = trialUsers.filter(u => u.status === 'expired');
  const specialAccess = trialUsers.filter(u => u.special_access);

  return (
    <div className="space-y-6">
      {/* Estatísticas de Trial */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Trials Ativos</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{activeTrials.length}</p>
            <p className="text-xs text-gray-500">Usuários em período trial</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Expirando</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{expiringTrials.length}</p>
            <p className="text-xs text-gray-500">Próximos ao vencimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Expirados</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{expiredTrials.length}</p>
            <p className="text-xs text-gray-500">Trials vencidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Atualizar</span>
              </div>
              <Button
                onClick={fetchTrialUsers}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuração de Data Personalizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Definir Data de Expiração Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="user-select">Selecionar Usuário</Label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione um usuário...</option>
                {trialUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} - {user.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="custom-date">Nova Data de Expiração</Label>
              <Input
                id="custom-date"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={setCustomExpiration}
                disabled={!selectedUser || !customDate}
                className="w-full"
              >
                Definir Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários Trial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usuários em Trial ({trialUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {trialUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {isLoading ? 'Carregando usuários trial...' : 'Nenhum usuário trial encontrado'}
                </p>
              ) : (
                trialUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(user)}
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-gray-500">
                            ID: {user.id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-400">
                            Criado: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {user.trial_expires_at && (
                            <p className="text-xs text-gray-400">
                              Trial expira: {new Date(user.trial_expires_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {user.custom_trial_expiration && (
                            <p className="text-xs text-purple-600 font-medium">
                              Expiração personalizada: {new Date(user.custom_trial_expiration).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(user)}
                        <p className="text-sm font-medium mt-2">
                          {user.days_remaining > 0 ? `${user.days_remaining} dias restantes` : 'Expirado'}
                        </p>
                        {user.custom_trial_expiration && (
                          <Button
                            onClick={() => removeCustomExpiration(user.id)}
                            variant="outline"
                            size="sm"
                            className="mt-2 text-red-600"
                          >
                            Remover Data Personalizada
                          </Button>
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
    </div>
  );
};

export default UsuariosTrial;