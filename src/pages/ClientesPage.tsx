
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import ClienteFormDialog from '@/components/clientes/ClienteFormDialog';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';
import { Users } from 'lucide-react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent } from '@/components/ui/card';

type Cliente = Database['public']['Tables']['clientes']['Row'];

const ClientesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clienteParaEdicao, setClienteParaEdicao] = useState<Cliente | null>(null);

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleSaveClient = async (clientData: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      if (clienteParaEdicao) {
        const { error } = await supabase
          .from('clientes')
          .update({
            ...clientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', clienteParaEdicao.id);
        
        if (error) throw error;
        
        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert({
            ...clientData,
            user_id: user.id
          });
        
        if (error) throw error;
        
        toast({
          title: "Cliente cadastrado",
          description: "O cliente foi cadastrado com sucesso."
        });
      }
      
      await fetchClients();
      setIsFormDialogOpen(false);
      setClienteParaEdicao(null);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao salvar cliente",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const handleEditClient = (client: Cliente) => {
    setClienteParaEdicao(client);
    setIsFormDialogOpen(true);
  };

  const handleViewClient = (client: Cliente) => {
    setClienteParaEdicao(client);
    setIsFormDialogOpen(true);
  };

  const handleToggleStatus = async (client: Cliente) => {
    const newStatus = client.status_cliente === 'Ativo' ? 'Inativo' : 'Ativo';
    
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ status_cliente: newStatus })
        .eq('id', client.id);
      
      if (error) throw error;
      
      toast({
        title: "Status alterado",
        description: `Cliente marcado como ${newStatus}.`
      });
      
      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
      
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso."
      });
      
      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
    setIsRefreshing(false);
    toast({
      title: "Lista atualizada",
      description: "A lista de clientes foi atualizada com sucesso."
    });
  };

  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj?.includes(searchTerm)
  );

  if (isLoading && clients.length === 0) {
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
            actionButtonText="Novo Cliente"
            onActionButtonClick={() => {
              setClienteParaEdicao(null);
              setIsFormDialogOpen(true);
            }}
            isLoading={isLoading || isRefreshing}
          />
        </div>

        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por nome, email, CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white/40 h-12 text-base backdrop-blur-sm"
              />
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              disabled={isRefreshing} 
              className="w-full sm:w-auto h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar Lista'}
            </Button>
          </div>
        </div>
        
        <div className="hidden md:block animate-fade-in">
          <ClienteTable
            clients={filteredClients}
            onEdit={handleEditClient}
            onView={handleViewClient}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteClient}
            isLoading={isLoading || isRefreshing}
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
            isLoading={isLoading || isRefreshing}
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
