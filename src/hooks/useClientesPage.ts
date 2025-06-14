
import { useEffect } from 'react';
import type { Cliente } from './clientes/types';
import { useClientesState } from './clientes/useClientesState';
import { useClientesActions } from './clientes/useClientesActions';

export const useClientesPage = () => {
  const { state, setters } = useClientesState();
  
  const {
    fetchClients,
    handleSaveClient,
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh
  } = useClientesActions({
    setClients: setters.setClients,
    setIsLoading: setters.setIsLoading,
    setIsRefreshing: setters.setIsRefreshing,
    setIsSubmitting: setters.setIsSubmitting,
    setIsFormDialogOpen: setters.setIsFormDialogOpen,
    setClienteParaEdicao: setters.setClienteParaEdicao,
    clienteParaEdicao: state.clienteParaEdicao
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleEditClient = (client: Cliente) => {
    setters.setClienteParaEdicao(client);
    setters.setIsFormDialogOpen(true);
  };

  const handleViewClient = (client: Cliente) => {
    setters.setClienteParaEdicao(client);
    setters.setIsFormDialogOpen(true);
  };

  const handleOpenNewClientForm = () => {
    setters.setClienteParaEdicao(null);
    setters.setIsFormDialogOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setters.setSearchTerm(term);
  };

  const filteredClients = state.clients.filter(client =>
    client.nome?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    client.cpfCnpj?.includes(state.searchTerm)
  );

  const isLoadingCombined = state.isLoading || state.isRefreshing || state.isSubmitting;

  return {
    // State
    searchTerm: state.searchTerm,
    isFormDialogOpen: state.isFormDialogOpen,
    clients: state.clients,
    filteredClients,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    isSubmitting: state.isSubmitting,
    clienteParaEdicao: state.clienteParaEdicao,
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
    setIsFormDialogOpen: setters.setIsFormDialogOpen,
    setClienteParaEdicao: setters.setClienteParaEdicao,
    fetchClients
  };
};
