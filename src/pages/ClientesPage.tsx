import React, { useEffect } from 'react';
// Importando o Provider e o hook do NOVO arquivo de contexto
import { ClientesProvider, useClientes } from '../contexts/ClientesContext'; 
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClientesTable from '@/components/clientes/ClientesTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useAuth } from '@/hooks/useAuth';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useMediaQuery } from "@/hooks/use-mobile";

// Componente de conteúdo que usa o hook useClientes
const ClientesPageContent = () => {
  const { user } = useAuth();
  // Agora usamos um único hook para obter todo o estado e ações
  const { clients, isLoading, error, loadClientes } = useClientes();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (user?.id) {
      // @ts-ignore
      loadClientes(user.id);
    }
  }, [user?.id, loadClientes]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
      <div className="space-y-6">
        <ClientesPageHeader />
        {isMobile ? (
          <ClienteListAsCards clients={clients} isLoading={isLoading} error={error} />
        ) : (
          <ClientesTable clients={clients} isLoading={isLoading} error={error} />
        )}
      </div>
      <ClienteFormDialog />
    </div>
  );
};

// Componente principal que apenas fornece o contexto
const ClientesPage = () => {
  return (
    <ClientesProvider>
      <ClientesPageContent />
    </ClientesProvider>
  );
};

export default ClientesPage;