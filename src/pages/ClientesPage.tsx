import React, { useEffect, useState } from 'react';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClientesPageHeader from '@/components/clientes/ClientesPageHeader';
import { useAuth } from '@/hooks/useAuth';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchClientsList } from '@/hooks/clientes/clienteApi';
import type { Cliente } from '@/hooks/clientes/types';

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-lg p-2"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="bg-gradient-to-b from-blue-600 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">JusGestão</h3>
                  <p className="text-blue-100 text-sm">Sistema Jurídico Completo</p>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                    Navegação
                  </h4>
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        className="w-full justify-start text-left h-12 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                        onClick={() => handleNavigate(item.path)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-3">
              <div className="text-white text-center">
                <h1 className="font-bold text-lg">Clientes</h1>
                <p className="text-blue-100 text-xs">Gestão de Clientes</p>
              </div>
            </div>
            
            <div className="w-10"></div>
          </div>
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