import React from 'react';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import ClienteSearchActionBar from '@/components/clientes/ClienteSearchActionBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useClientesPage } from '@/hooks/useClientesPage';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Users, UserPlus } from 'lucide-react';

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <SharedPageHeader
        title="Clientes"
        description="Gerencie seus clientes"
        pageIcon={<Users />}
        actionButtonText="Novo Cliente"
        actionButtonIcon={<UserPlus className="h-4 w-4 mr-2" />}
        onActionButtonClick={handleOpenNewClientForm}
        isLoading={isLoadingCombined}
      />

      <ClienteSearchActionBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClient={handleOpenNewClientForm}
        onRefresh={handleRefresh}
        isLoading={isLoadingCombined}
      />

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

      <ClienteFormDialog 
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
};

export default ClientesPage;