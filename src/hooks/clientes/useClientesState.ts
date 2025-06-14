
import { useState } from 'react';
import type { Cliente, ClientesPageState } from './types';

export const useClientesState = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clienteParaEdicao, setClienteParaEdicao] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state: ClientesPageState = {
    searchTerm,
    isFormDialogOpen,
    clients,
    isLoading,
    isRefreshing,
    clienteParaEdicao,
    isSubmitting,
  };

  return {
    state,
    setters: {
      setSearchTerm,
      setIsFormDialogOpen,
      setClients,
      setIsLoading,
      setIsRefreshing,
      setClienteParaEdicao,
      setIsSubmitting,
    }
  };
};
