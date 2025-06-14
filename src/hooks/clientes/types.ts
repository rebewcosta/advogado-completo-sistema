
import type { Database } from '@/integrations/supabase/types';

export type Cliente = Database['public']['Tables']['clientes']['Row'];

export type ClienteFormData = Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface ClientesPageState {
  searchTerm: string;
  isFormDialogOpen: boolean;
  clients: Cliente[];
  isLoading: boolean;
  isRefreshing: boolean;
  clienteParaEdicao: Cliente | null;
  isSubmitting: boolean;
}

export interface ClientesPageActions {
  handleSearchChange: (term: string) => void;
  handleSaveClient: (clientData: ClienteFormData) => Promise<boolean>;
  handleEditClient: (client: Cliente) => void;
  handleViewClient: (client: Cliente) => void;
  handleToggleStatus: (client: Cliente) => void;
  handleDeleteClient: (clientId: string) => void;
  handleRefresh: () => Promise<void>;
  handleOpenNewClientForm: () => void;
  setIsFormDialogOpen: (open: boolean) => void;
  setClienteParaEdicao: (client: Cliente | null) => void;
  fetchClients: () => Promise<void>;
}
