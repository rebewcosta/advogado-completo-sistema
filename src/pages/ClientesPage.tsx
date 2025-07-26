import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o useNavigate
import AdminLayout from '@/components/AdminLayout';
import { Spinner } from '@/components/ui/spinner';
import { Users } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import ClienteSearchActionBar from '@/components/clientes/ClienteSearchActionBar';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useClientesPage } from '@/hooks/useClientesPage';

const ClientesPage = () => {
  const navigate = useNavigate(); // Hook para navegação
  const {
    searchTerm,
    filteredClients,
    isLoadingCombined,
    clients,
    handleSearchChange,
    handleViewClient, // Manter se houver uma página de detalhes
    handleToggleStatus,
    handleDeleteClient,
    handleRefresh,
  } = useClientesPage();

  const handleAddNewClient = () => {
    navigate('/clientes/novo'); // Navega para a nova página de formulário
  };

  const handleEditClient = (clientId: string) => {
    navigate(`/clientes/editar/${clientId}`); // Navega para a página de edição
  };

  if (isLoadingCombined && !clients.length) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-full">
          <div className="text-center">
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
        <SharedPageHeader
          title="Gestão de Clientes"
          description="Cadastre, visualize e gerencie todos os seus clientes."
          pageIcon={<Users className="text-blue-500" />}
        />

        <ClienteSearchActionBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddClient={handleAddNewClient} // Usa a nova função
          onRefresh={handleRefresh}
          isLoading={isLoadingCombined}
        />
        
        <div className="hidden md:block mt-6">
          <ClienteTable
            clients={filteredClients}
            onEdit={(client) => handleEditClient(client.id)} // Usa a nova função
            onView={handleViewClient}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteClient}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          }
          />
        </div>
        <div className="md:hidden mt-4">
          <ClienteListAsCards
            clients={filteredClients}
            onEdit={(client) => handleEditClient(client.id)} // Usa a nova função
            onView={handleViewClient}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteClient}
            isLoading={isLoadingCombined}
            searchTerm={searchTerm}
          }
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClientesPage;