// src/pages/ClientesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClienteForm from '@/components/ClienteForm';
import { X, Edit, Eye, Plus, Search, MoreVertical, Trash2, RefreshCw, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import ClienteTable from '@/components/clientes/ClienteTable'; // <<< IMPORTAR A NOVA TABELA

type Cliente = Database['public']['Tables']['clientes']['Row'];

type ClienteFormDataFromForm = {
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  cpfCnpj: string;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  status_cliente?: string;
};

const ClientesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [isRefreshingManually, setIsRefreshingManually] = useState(false);


  const fetchClients = useCallback(async (showLoadingSpinner = true) => {
    if (!user) {
      setClients([]);
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
      return;
    }
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshingManually(true);

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message || "Não foi possível buscar os dados dos clientes.",
        variant: "destructive",
      });
      setClients([]);
    } finally {
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchClients();

      const channel = supabase
        .channel('public:clientes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clientes', filter: `user_id=eq.${user.id}` },
          (payload) => {
            toast({
                title: "Atualização Automática",
                description: "A lista de clientes foi atualizada.",
                duration: 3000,
            });
            fetchClients(false);
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime: Conectado ao canal de clientes!');
          }
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Realtime: Erro no canal de clientes:', err || status);
            toast({ title: "Erro de Conexão Realtime", description: "Não foi possível sincronizar os dados de clientes em tempo real.", variant: "destructive"});
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setClients([]);
      setIsLoading(false);
    }
  }, [user, fetchClients, toast]);

  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.cpfCnpj && client.cpfCnpj.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSaveClient = async (formDataFromForm: ClienteFormDataFromForm) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para salvar um cliente.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);

    const dadosParaSupabase = {
      nome: formDataFromForm.nome,
      email: formDataFromForm.email,
      telefone: formDataFromForm.telefone,
      tipo_cliente: formDataFromForm.tipo,
      cpfCnpj: formDataFromForm.cpfCnpj,
      endereco: formDataFromForm.endereco,
      cidade: formDataFromForm.cidade,
      estado: formDataFromForm.estado,
      cep: formDataFromForm.cep,
      observacoes: formDataFromForm.observacoes,
      status_cliente: formDataFromForm.status_cliente || 'Ativo',
    };

    try {
      let responseData: Cliente | null = null;
      
      if (isEditing && selectedClient) {
        const { data, error } = await supabase
          .from('clientes')
          .update(dadosParaSupabase)
          .eq('id', selectedClient.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        responseData = data;
      } else {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ ...dadosParaSupabase, user_id: user.id }])
          .select()
          .single();
        
        if (error) throw error;
        responseData = data;
      }

      if (responseData) {
        toast({ 
            title: isEditing ? "Cliente atualizado!" : "Cliente cadastrado!", 
            description: `${responseData.nome} foi ${isEditing ? 'atualizado' : 'salvo'} com sucesso.` 
        });
        setShowForm(false);
        setSelectedClient(null);
        setIsEditing(false);
      }
    } catch (error: any) { 
      console.error("Erro ao salvar cliente:", error);
      let toastTitle = isEditing ? "Erro ao Atualizar Cliente" : "Erro ao Cadastrar Cliente";
      let toastDescription = error.message || "Ocorreu um erro inesperado.";

      if (error.message && error.message.includes('Já existe um cliente cadastrado com este CPF/CNPJ para sua conta.')) {
        toastDescription = error.message;
      } 
      else if (error.message && 
          error.message.toLowerCase().includes('duplicate key value violates unique constraint') &&
          (error.message.toLowerCase().includes('cpfnnpj') ||
           error.message.toLowerCase().includes("unique constraint") && error.message.toLowerCase().includes("clientes"))) { 
        toastDescription = "Este CPF/CNPJ já está cadastrado. Por favor, verifique os dados.";
      }
      else if (error.message && error.message.toLowerCase().includes('record "new" has no field "cpfcnpj"')) {
        toastDescription = "Erro interno no banco de dados ao verificar CPF/CNPJ (trigger). Contate o suporte.";
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = (client: Cliente) => {
    const formDataForEdit = {
        nome: client.nome,
        email: client.email || '',
        telefone: client.telefone || '',
        tipo: client.tipo_cliente,
        cpfCnpj: client.cpfCnpj || '',
        endereco: client.endereco || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
        observacoes: client.observacoes || '',
        status_cliente: client.status_cliente,
    };
    setSelectedClient({ ...client, ...formDataForEdit });
    setIsEditing(true);
    setShowForm(true);
    setShowClientDetails(false); 
  };

  const handleViewClient = (client: Cliente) => {
    setSelectedClient(client);
    setShowClientDetails(true);
    setShowForm(false); 
  };

  const handleToggleStatus = async (clientToToggle: Cliente) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true); 
    const newStatus = clientToToggle.status_cliente === "Ativo" ? "Inativo" : "Ativo";
    try {
      const { data: updatedClient, error } = await supabase
        .from('clientes')
        .update({ status_cliente: newStatus })
        .eq('id', clientToToggle.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (updatedClient) {
         toast({
          title: "Status atualizado",
          description: `Cliente ${updatedClient.nome} agora está ${newStatus}.`
        });
      }
    } catch (error: any) {
      toast({ title: "Erro ao atualizar status", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user || isSubmitting) return;
    const clientToDelete = clients.find(c => c.id === clientId);
    if (clientToDelete && window.confirm(`Tem certeza que deseja excluir o cliente ${clientToDelete.nome}? Esta ação não pode ser desfeita.`)) {
      setIsSubmitting(true); 
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', clientId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({
          title: "Cliente excluído",
          description: `O cliente ${clientToDelete.nome} foi excluído com sucesso.`,
        });
      } catch (error: any) {
        console.error("Erro ao excluir cliente:", error);
        toast({ title: "Erro ao excluir", description: error.message || "Ocorreu um erro.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleManualRefresh = () => {
    fetchClients(true);
  };

  const isLoadingCombined = isLoading || isSubmitting || isRefreshingManually;

  if (isLoadingCombined && !clients.length && !isRefreshingManually) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando clientes...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
              <Users className="mr-3 h-7 w-7 text-lawyer-primary" />
              Gestão de Clientes
            </h1>
            <p className="text-gray-600 text-left mt-1">
              Cadastre, visualize e gerencie todos os seus clientes.
            </p>
          </div>
           <Button onClick={handleAddClient} className="mt-4 md:mt-0 w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
        </div>
        
        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative flex-grow sm:max-w-xs md:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                        type="text"
                        placeholder="Buscar por nome, email, CPF/CNPJ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-sm h-10 w-full bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-lawyer-primary focus:border-lawyer-primary"
                        />
                    </div>
                    <Button 
                        onClick={handleManualRefresh} 
                        variant="outline" 
                        size="sm" 
                        disabled={isLoadingCombined} 
                        className="w-full sm:w-auto text-xs h-10 border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoadingCombined ? 'animate-spin' : ''}`} />
                        {isLoadingCombined ? 'Atualizando...' : 'Atualizar Lista'}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block"> {/* Visível em md e acima */}
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
        <div className="md:hidden"> {/* Visível abaixo de md */}
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


        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) {
            setSelectedClient(null);
            setIsEditing(false);
          }
          setShowForm(open);
        }}>
          <DialogContent className="p-0 max-w-2xl overflow-auto max-h-[90vh] flex flex-col">
            <ClienteForm
              onSave={handleSaveClient}
              onCancel={() => { setShowForm(false); setSelectedClient(null); setIsEditing(false); }}
              cliente={selectedClient}
              isEdit={isEditing}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
          <DialogContent className="p-0 max-w-lg md:max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            {selectedClient && (
              <>
                <DialogHeader className="p-4 pb-3 border-b sticky top-0 bg-white z-10">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-lg font-semibold">{selectedClient.nome}</DialogTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowClientDetails(false)} className="h-7 w-7 text-gray-500 hover:text-gray-700 -mr-2 -mt-1">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogDescription className="text-xs text-gray-500 pt-0.5">
                    Detalhes do cliente.
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4 space-y-3 text-sm text-gray-700 overflow-y-auto flex-grow">
                  <p><strong>Email:</strong> {selectedClient.email || 'N/A'}</p>
                  <p><strong>Telefone:</strong> {selectedClient.telefone || 'N/A'}</p>
                  <p><strong>Tipo:</strong> {selectedClient.tipo_cliente}</p>
                  <p><strong>CPF/CNPJ:</strong> {selectedClient.cpfCnpj || 'N/A'}</p>
                  <p><strong>Endereço:</strong> {selectedClient.endereco || 'N/A'}</p>
                  <p><strong>Cidade:</strong> {selectedClient.cidade || 'N/A'}</p>
                  <p><strong>Estado:</strong> {selectedClient.estado || 'N/A'}</p>
                  <p><strong>CEP:</strong> {selectedClient.cep || 'N/A'}</p>
                  <p><strong>Status:</strong> 
                    <Badge 
                      variant={selectedClient.status_cliente === "Ativo" ? "default" : "destructive"}
                      className={`ml-2 text-xs ${selectedClient.status_cliente === "Ativo" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
                    >
                      {selectedClient.status_cliente}
                    </Badge>
                  </p>
                  <p><strong>Observações:</strong> {selectedClient.observacoes || 'Nenhuma'}</p>
                  <p><strong>Cadastrado em:</strong> {new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <DialogFooter className="p-4 border-t flex-shrink-0 sticky bottom-0 bg-white z-10">
                  <Button variant="outline" onClick={() => {
                    setShowClientDetails(false);
                    handleEditClient(selectedClient);
                  }}>
                    Editar
                  </Button>
                  <Button onClick={() => setShowClientDetails(false)} className="bg-lawyer-primary hover:bg-lawyer-primary/90 text-white">Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ClientesPage;