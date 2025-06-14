
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Spinner } from '@/components/ui/spinner';
import { Users } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import ClienteSearchActionBar from '@/components/clientes/ClienteSearchActionBar';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import { useClientesPage } from '@/hooks/useClientesPage';

const ClientesPage = () => {
  const {
    searchTerm,
    isFormDialogOpen,
    filteredClients,
    isLoadingCombined,
    clienteParaEdicao,
    clients,
    handleSearchChange,
    handleSaveClient,
    handleEditClient,
    handleViewClient,
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh,
    handleOpenNewClientForm,
    setIsFormDialogOpen,
    setClienteParaEdicao
  } = useClientesPage();

  if (isLoadingCombined && !clients.length) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full flex flex-col justify-center items-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl">
            <Spinner size="lg" className="text-blue-500" />
            <span className="text-gray-700 mt-4 block font-medium">Carregando clientes...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-full">
        <div className="animate-fade-in">
          <SharedPageHeader
            title="Gestão de Clientes"
            description="Cadastre, visualize e gerencie todos os seus clientes com ferramentas modernas e eficientes."
            pageIcon={<Users className="text-blue-500" />}
            showActionButton={false}
            isLoading={isLoadingCombined}
          />
        </div>

        <ClienteSearchActionBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddClient={handleOpenNewClientForm}
          onRefresh={handleRefresh}
          isLoading={isLoadingCombined}
        />
        
        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block animate-fade-in">
          <ClienteTable
            clients={filteredClients}
            onEdit={handleEditClient}
            onView={handleViewClient}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteClient}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          />
        </div>
        <div className="md:hidden animate-fade-in">
          <ClienteListAsCards
            clients={filteredClients}
            onEdit={handleEditClient}
            onView={handleViewClient}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteClient}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          />
        </div>

        <ClienteFormDialog
          isOpen={isFormDialogOpen}
          onClose={() => {
            setIsFormDialogOpen(false);
            setClienteParaEdicao(null);
          }}
          onSave={handleSaveClient}
          cliente={clienteParaEdicao}
        />
      </div>
    </AdminLayout>
  );
};

export default ClientesPage;
