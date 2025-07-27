import React from 'react';
import { ClientesProvider } from '@/contexts/ClientesContext';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClientesTable from '@/components/clientes/ClientesTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useClientes } from '@/hooks/clientes/useClientes';

// 1. Criamos um componente interno para o conteúdo da página
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

  // Toda a lógica e JSX da página ficam aqui dentro.
  // Como este componente é filho do ClientesProvider, ele tem acesso ao contexto.
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
      {/* O formulário de diálogo também está aqui dentro, com acesso ao contexto */}
      <ClienteFormDialog />
    </div>
  );
};

// 2. O componente principal da página agora tem uma única responsabilidade:
// Fornecer o contexto para todos os seus componentes filhos.
const ClientesPage = () => {
  return (
    <ClientesProvider>
      <ClientesPageContent />
    </ClientesProvider>
  );
};

export default ClientesPage;