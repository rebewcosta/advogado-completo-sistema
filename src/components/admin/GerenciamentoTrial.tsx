import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Settings,
  RotateCcw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TrialUser {
  id: string;
  email: string;
  created_at: string;
  trial_end_date: string;
  is_expired: boolean;
  days_remaining: number;
  has_custom_expiration: boolean;
  subscription_status: string;
}

const GerenciamentoTrial = () => {
  const [users, setUsers] = useState<TrialUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TrialUser | null>(null);
  const [newExpirationDate, setNewExpirationDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTrialUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { action: 'list_trial_users' }
      });

      if (error) throw error;

      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching trial users:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários em trial",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetExpiration = async () => {
    if (!selectedUser || !newExpirationDate) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { 
          action: 'set_trial_expiration',
          user_id: selectedUser.id,
          expiration_date: newExpirationDate
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: data.message,
      });

      setIsDialogOpen(false);
      setSelectedUser(null);
      setNewExpirationDate('');
      fetchTrialUsers();
    } catch (error) {
      console.error('Error setting expiration:', error);
      toast({
        title: "Erro",
        description: "Falha ao definir data de expiração",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveCustomExpiration = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gerenciar-trial', {
        body: { 
          action: 'remove_custom_expiration',
          user_id: userId
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: data.message,
      });

      fetchTrialUsers();
    } catch (error) {
      console.error('Error removing custom expiration:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover data customizada",
        variant: "destructive",
      });
    }
  };

  const openExpirationDialog = (user: TrialUser) => {
    setSelectedUser(user);
    // Definir data padrão como hoje + 1 dia
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewExpirationDate(tomorrow.toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (user: TrialUser) => {
    if (user.is_expired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    if (user.days_remaining <= 1) {
      return <Badge variant="destructive">Expira hoje</Badge>;
    }
    if (user.days_remaining <= 3) {
      return <Badge variant="destructive">Crítico</Badge>;
    }
    if (user.days_remaining <= 7) {
      return <Badge variant="outline">Ativo</Badge>;
    }
    return <Badge>Ativo</Badge>;
  };

  useEffect(() => {
    fetchTrialUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Trial</h2>
        <Button onClick={fetchTrialUsers} disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total em Trial</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.is_expired).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expirando (≤3d)</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => !u.is_expired && u.days_remaining <= 3).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Data Custom</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.has_custom_expiration).length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários em Trial</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando usuários...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{user.email}</span>
                      {getStatusBadge(user)}
                      {user.has_custom_expiration && (
                        <Badge variant="outline" className="text-purple-600">
                          <Settings className="h-3 w-3 mr-1" />
                          Customizado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Criado: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        Expira: {new Date(user.trial_end_date).toLocaleDateString('pt-BR')}
                      </span>
                      <span>
                        {user.is_expired ? 'Expirado' : `${user.days_remaining} dias restantes`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.has_custom_expiration && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCustomExpiration(user.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Padrão
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openExpirationDialog(user)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Alterar Data
                    </Button>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário em trial encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para definir nova data */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Data de Expiração</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Usuário:</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Data atual de expiração:</p>
                <p className="font-medium">
                  {new Date(selectedUser.trial_end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration-date">Nova data de expiração:</Label>
                <Input
                  id="expiration-date"
                  type="date"
                  value={newExpirationDate}
                  onChange={(e) => setNewExpirationDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSetExpiration}
                  disabled={isUpdating || !newExpirationDate}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciamentoTrial;