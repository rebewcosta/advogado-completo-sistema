import React, { useEffect, useState } from 'react';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useAuth } from '@/hooks/useAuth';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchClientsList } from '@/hooks/clientes/clienteApi';
import type { Cliente } from '@/hooks/clientes/types';

// Componente principal
const ClientesPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const loadClientes = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await fetchClientsList(user.id);
      setClients(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadClientes();
    }
  }, [user?.id]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 dark:text-gray-200">
      <div className="space-y-6">
        <ClientesPageHeader onAddClient={handleOpenModal} />
        {isMobile ? (
          <ClienteListAsCards 
            clients={clients} 
            isLoading={isLoading} 
            searchTerm=""
            onEdit={() => {}}
            onView={() => {}}
            onToggleStatus={() => {}}
            onDelete={() => {}}
          />
        ) : (
          <ClienteTable 
            clients={clients} 
            isLoading={isLoading} 
            searchTerm=""
            onEdit={() => {}}
            onView={() => {}}
            onToggleStatus={() => {}}
            onDelete={() => {}}
          />
        )}
      </div>
      <ClienteFormDialog 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={loadClientes}
      />
    </div>
  );
};

export default ClientesPage;