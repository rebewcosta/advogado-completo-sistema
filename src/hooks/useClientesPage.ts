import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Cliente = Database['public']['Tables']['clientes']['Row'];

export const useClientesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clienteParaEdicao, setClienteParaEdicao] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = async (clientData: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    setIsSubmitting(true);
    try {
      // Preparar dados para salvamento, convertendo campos vazios para valores apropriados
      const dataToSave = {
        ...clientData,
        // Converter email vazio para null para evitar conflito de unique constraint
        email: clientData.email && clientData.email.trim() ? clientData.email.trim() : null,
        telefone: clientData.telefone || '',
        endereco: clientData.endereco || '',
        cidade: clientData.cidade || '',
        estado: clientData.estado || '',
        cep: clientData.cep || '',
        observacoes: clientData.observacoes || ''
      };

      console.log('Dados para salvar:', dataToSave);

      if (clienteParaEdicao) {
        const { error } = await supabase
          .from('clientes')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', clienteParaEdicao.id);
        
        if (error) {
          console.error('Erro ao atualizar cliente:', error);
          throw error;
        }
        
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert({
            ...dataToSave,
            user_id: user.id
          });
        
        if (error) {
          console.error('Erro ao inserir cliente:', error);
          throw error;
        }
        
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
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error.message?.includes('clientes_email_key')) {
        errorMessage = "Este email já está cadastrado para outro cliente.";
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "Já existe um cliente com essas informações.";
      } else if (error.message) {
        errorMessage = error.message;
      }

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

  const handleEditClient = (client: Cliente) => {
    setClienteParaEdicao(client);
    setIsFormDialogOpen(true);
  };

  const handleViewClient = (client: Cliente) => {
    setClienteParaEdicao(client);
    setIsFormDialogOpen(true);
  };

  const handleToggleStatus = async (client: Cliente) => {
    if (isSubmitting) return;
    
    const newStatus = client.status_cliente === 'Ativo' ? 'Inativo' : 'Ativo';
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ status_cliente: newStatus })
        .eq('id', client.id);
      
      if (error) throw error;
      
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
    if (isSubmitting) return;
    
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', clientId);
        
        if (error) throw error;
        
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

  const handleOpenNewClientForm = () => {
    setClienteParaEdicao(null);
    setIsFormDialogOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj?.includes(searchTerm)
  );

  const isLoadingCombined = isLoading || isRefreshing || isSubmitting;

  return {
    // State
    searchTerm,
    isFormDialogOpen,
    clients,
    filteredClients,
    isLoading,
    isRefreshing,
    isSubmitting,
    clienteParaEdicao,
    isLoadingCombined,
    
    // Actions
    handleSearchChange,
    handleSaveClient,
    handleEditClient,
    handleViewClient,
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh,
    handleOpenNewClientForm,
    setIsFormDialogOpen,
    setClienteParaEdicao,
    fetchClients
  };
};
