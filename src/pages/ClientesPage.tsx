import React from 'react';
// Corrigido: Usando caminho relativo para garantir a importação correta
import { ClientesProvider } from '../contexts/ClientesContext'; 
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClientesTable from '@/components/clientes/ClientesTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useClientes } from '@/hooks/clientes/useClientes';

const ClientesPageContent = () => {
  const { 
    clients, 
    isLoading, 
    error,
    searchTerm, 
    setSearchTerm,
    sortOrder,
    setSortOrder
  } = useClientes();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
      <div className="space-y-6">
        <ClientesPageHeader 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <ClientesTable 
          clients={clients} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
      <ClienteFormDialog />
    </div>
  );
};

const ClientesPage = () => {
  return (
    <ClientesProvider>
      <ClientesPageContent />
    </ClientesProvider>
  );
};

export default ClientesPage;