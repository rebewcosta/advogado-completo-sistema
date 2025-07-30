import React, { useEffect, useState } from 'react';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useAuth } from '@/hooks/useAuth';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchClientsList } from '@/hooks/clientes/clienteApi';
import type { Cliente } from '@/hooks/clientes/types';
import MobileHeader from '@/components/MobileHeader';
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const menuItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Processos', path: '/processos' },
  { label: 'Agenda', path: '/agenda' },
  { label: 'Tarefas', path: '/tarefas' },
  { label: 'Financeiro', path: '/financeiro' },
  { label: 'Documentos', path: '/documentos' },
  { label: 'Equipe', path: '/equipe' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Configurações', path: '/configuracoes' },
];

// Componente principal
const ClientesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile && (
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-6">Menu de Navegação</h3>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleNavigate(item.path)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <MobileHeader />
        </div>
      )}
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
    </div>
  );
};

export default ClientesPage;