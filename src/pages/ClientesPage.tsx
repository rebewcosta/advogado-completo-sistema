import React from 'react';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClientesPage } from '@/hooks/useClientesPage';
import MobileHeader from '@/components/MobileHeader';

const ClientesPage = () => {
  const isMobile = useIsMobile();
  const {
    filteredClients,
    isLoadingCombined,
    searchTerm,
    isFormDialogOpen,
    clienteParaEdicao,
    handleSearchChange,
    handleSaveClient,
    handleEditClient,
    handleViewClient,
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh,
    handleOpenNewClientForm,
    setIsFormDialogOpen
  } = useClientesPage();

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile && <MobileHeader />}
      
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
        <div className="space-y-6">
          <ClientesPageHeader onAddClient={handleOpenNewClientForm} />
          {isMobile ? (
            <ClienteListAsCards 
              clients={filteredClients} 
              isLoading={isLoadingCombined} 
              searchTerm={searchTerm}
              onEdit={handleEditClient}
              onView={handleViewClient}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteClient}
            />
          ) : (
            <ClienteTable 
              clients={filteredClients} 
              isLoading={isLoadingCombined} 
              searchTerm={searchTerm}
              onEdit={handleEditClient}
              onView={handleViewClient}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteClient}
            />
          )}
        </div>
        <ClienteFormDialog 
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          onSave={() => {}}
        />
      </div>
    </div>
  );
};

export default ClientesPage;