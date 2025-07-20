import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  RefreshCw, 
  Calendar,
  Search,
  UserCheck,
  UserX,
  Mail,
  Clock
} from 'lucide-react';

interface CreatedAccount {
  id: string;
  email: string;
  created_at: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  raw_user_meta_data?: any;
  subscription_status?: string;
  special_access?: boolean;
}

const UsuariosCriados = () => {
  const [createdAccounts, setCreatedAccounts] = useState<CreatedAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<CreatedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAccountsCount, setTotalAccountsCount] = useState(0);
  const { toast } = useToast();

  const fetchCreatedAccounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-all-users');
      
      if (error) throw error;

      if (data?.users) {
        const accounts: CreatedAccount[] = data.users.map((user: any) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          confirmed_at: user.confirmed_at,
          last_sign_in_at: user.last_sign_in_at,
          raw_user_meta_data: user.raw_user_meta_data,
          subscription_status: user.raw_user_meta_data?.subscription_status,
          special_access: user.raw_user_meta_data?.special_access
        }));
        
        setCreatedAccounts(accounts);
        setFilteredAccounts(accounts);
        setTotalAccountsCount(accounts.length);
        
        toast({
          title: "Dados atualizados",
          description: `${accounts.length} contas encontradas.`,
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar contas criadas:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatedAccounts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredAccounts(createdAccounts);
    } else {
      const filtered = createdAccounts.filter(account =>
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.raw_user_meta_data?.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccounts(filtered);
    }
  }, [searchTerm, createdAccounts]);

  const getAccountStatus = (account: CreatedAccount) => {
    if (account.special_access) {
      return { 
        badge: <Badge className="bg-purple-500 text-white">Acesso Especial</Badge>,
        icon: <UserCheck className="h-4 w-4 text-purple-500" />
      };
    }
    
    if (account.subscription_status === 'active') {
      return { 
        badge: <Badge className="bg-green-500 text-white">Assinante Ativo</Badge>,
        icon: <UserCheck className="h-4 w-4 text-green-500" />
      };
    }
    
    if (account.confirmed_at) {
      return { 
        badge: <Badge className="bg-blue-500 text-white">Confirmado</Badge>,
        icon: <UserCheck className="h-4 w-4 text-blue-500" />
      };
    }
    
    return { 
      badge: <Badge className="bg-yellow-500 text-white">Pendente</Badge>,
      icon: <UserX className="h-4 w-4 text-yellow-500" />
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const confirmedAccounts = createdAccounts.filter(acc => acc.confirmed_at);
  const pendingAccounts = createdAccounts.filter(acc => !acc.confirmed_at);
  const subscribedAccounts = createdAccounts.filter(acc => acc.subscription_status === 'active');
  const specialAccessAccounts = createdAccounts.filter(acc => acc.special_access);

  return (
    <div className="space-y-6">
      {/* Estatísticas de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total de Contas</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalAccountsCount}</p>
            <p className="text-xs text-gray-500">Contas criadas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Confirmadas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{confirmedAccounts.length}</p>
            <p className="text-xs text-gray-500">E-mails confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{pendingAccounts.length}</p>
            <p className="text-xs text-gray-500">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Premium</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{subscribedAccounts.length}</p>
            <p className="text-xs text-gray-500">Assinantes ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar e Filtrar Contas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar por email, nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={fetchCreatedAccounts}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredAccounts.length} de {totalAccountsCount} contas
            {searchTerm && ` (filtrado por: "${searchTerm}")`}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contas Criadas ({filteredAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredAccounts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {isLoading ? 'Carregando contas...' : 
                   searchTerm ? 'Nenhuma conta encontrada com os critérios de busca' : 
                   'Nenhuma conta encontrada'}
                </p>
              ) : (
                filteredAccounts.map((account) => {
                  const status = getAccountStatus(account);
                  return (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {status.icon}
                          <div>
                            <p className="font-medium">{account.email}</p>
                            {account.raw_user_meta_data?.nome_completo && (
                              <p className="text-sm text-gray-600">
                                {account.raw_user_meta_data.nome_completo}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              ID: {account.id.substring(0, 8)}...
                            </p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Criado: {formatDate(account.created_at)}
                              </span>
                              {account.confirmed_at && (
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />
                                  Confirmado: {formatDate(account.confirmed_at)}
                                </span>
                              )}
                              {account.last_sign_in_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Último login: {formatDate(account.last_sign_in_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {status.badge}
                          {account.subscription_status && (
                            <p className="text-xs text-gray-500 mt-1">
                              Status: {account.subscription_status}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsuariosCriados;