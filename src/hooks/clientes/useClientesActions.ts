
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import type { Cliente, ClienteFormData } from './types';
import { 
  fetchClientsList, 
  createClient, 
  updateClient, 
  toggleClientStatus, 
  deleteClient 
} from './clienteApi';
import { getErrorMessage } from './clienteValidation';

interface UseClientesActionsProps {
  setClients: (clients: Cliente[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsRefreshing: (refreshing: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsFormDialogOpen: (open: boolean) => void;
  setClienteParaEdicao: (client: Cliente | null) => void;
  clienteParaEdicao: Cliente | null;
}

export const useClientesActions = ({
  setClients,
  setIsLoading,
  setIsRefreshing,
  setIsSubmitting,
  setIsFormDialogOpen,
  setClienteParaEdicao,
  clienteParaEdicao
}: UseClientesActionsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClients = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await fetchClientsList(user.id);
      setClients(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setClients, setIsLoading]);

  const handleSaveClient = async (clientData: ClienteFormData): Promise<boolean> => {
    if (!user) return false;

    setIsSubmitting(true);
    try {
      console.log('Dados para salvar:', clientData);

      if (clienteParaEdicao) {
        await updateClient(clientData, clienteParaEdicao.id);
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso."
        });
      } else {
        await createClient(clientData, user.id);
        toast({
          title: "Cliente cadastrado",
          description: "O cliente foi cadastrado com sucesso."
        });
      }
      
      await fetchClients();
      setIsFormDialogOpen(false);
      setClienteParaEdicao(null);
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao salvar cliente",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: Cliente) => {
    const newStatus = client.status_cliente === 'Ativo' ? 'Inativo' : 'Ativo';
    
    setIsSubmitting(true);
    try {
      await toggleClientStatus(client.id, newStatus);
      
      toast({
        title: "Status alterado",
        description: `Cliente marcado como ${newStatus}.`
      });
      
      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setIsSubmitting(true);
      try {
        await deleteClient(clientId);
        
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso."
        });
        
        await fetchClients();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir cliente",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
    setIsRefreshing(false);
    toast({
      title: "Lista atualizada",
      description: "A lista de clientes foi atualizada com sucesso."
    });
  };

  return {
    fetchClients,
    handleSaveClient,
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh
  };
};
