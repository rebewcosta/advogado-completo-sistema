// src/pages/ClientesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClienteForm from '@/components/ClienteForm';
import { X, Edit, Eye, Plus, Search, MoreVertical, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { Spinner } from '@/components/ui/spinner';

// CONFIRME QUE SEU types.ts AGORA TEM 'cpfCnpj' AQUI
type Cliente = Database['public']['Tables']['clientes']['Row'] & {
    cpfCnpj?: string; // Adicionado para garantir que o tipo espere cpfCnpj se types.ts não foi atualizado
};


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

  console.log('ClientesPage: Componente renderizado/montado. Usuário atual:', user?.id);

  const fetchClients = useCallback(async (showLoadingSpinner = true) => {
    if (!user) {
      console.log('fetchClients: Usuário não disponível, limpando clientes.');
      setClients([]);
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
      return;
    }
    console.log(`WorkspaceClients: Buscando clientes para user ID: ${user.id}. Mostrar Spinner: ${showLoadingSpinner}`);
    if (showLoadingSpinner) setIsLoading(true);
    setIsRefreshingManually(true);

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      if (error) {
        console.error("fetchClients: Erro ao buscar clientes do Supabase:", error);
        throw error;
      }
      console.log('fetchClients: Dados recebidos do Supabase:', data);
      setClients(data || []);
    } catch (error: any) {
      console.error("fetchClients: Erro no bloco catch:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message || "Não foi possível buscar os dados dos clientes.",
        variant: "destructive",
      });
      setClients([]);
    } finally {
      console.log('fetchClients: Finalizado.');
      if (showLoadingSpinner) setIsLoading(false);
      setIsRefreshingManually(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      console.log('ClientesPage useEffect[user, fetchClients, toast]: Usuário existe. USER ID PARA FILTRO REALTIME:', user.id);
      fetchClients(); 

      const channel = supabase
        .channel('public:clientes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'clientes', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('REALTIME PAYLOAD CLIENTES:', payload);
            toast({
                title: "Atualização Automática",
                description: `Lista de clientes atualizada devido a um evento de ${payload.eventType}.`,
                duration: 4000,
            });
            // Opção 1: Simplesmente re-fazer o fetch (como estava)
            fetchClients(false);

            // Opção 2: Manipulação direta do estado (mais otimizado, mas mais complexo)
            // Descomente e adapte se a Opção 1 não for responsiva o suficiente
            /*
            setClients(prevClients => {
              let newClients = [...prevClients];
              if (payload.eventType === 'INSERT') {
                // @ts-ignore
                if (!newClients.find(c => c.id === payload.new.id)) {
                  // @ts-ignore
                  newClients.push(payload.new);
                }
              } else if (payload.eventType === 'UPDATE') {
                // @ts-ignore
                newClients = newClients.map(c => (c.id === payload.new.id ? payload.new : c));
              } else if (payload.eventType === 'DELETE') {
                // @ts-ignore
                newClients = newClients.filter(c => c.id !== payload.old.id);
              }
              return newClients.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? ""));
            });
            */
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime: Conectado ao canal de clientes!');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.error(`Realtime: Erro/Status no canal de clientes: ${status}`, err);
            toast({ title: "Erro de Conexão Realtime", description: `Status do canal: ${status}. A sincronização de clientes pode não funcionar.`, variant: "destructive", duration: 7000});
          } else {
            console.log(`Realtime: Status do canal de clientes: ${status}`);
          }
        });

      return () => {
        console.log("Realtime: Desinscrevendo do canal de clientes.");
        supabase.removeChannel(channel).catch(err => console.error("Erro ao remover canal realtime", err));
      };
    } else {
      console.log('ClientesPage useEffect[user, fetchClients, toast]: Sem usuário, limpando clientes.');
      setClients([]);
      setIsLoading(false);
    }
  }, [user, fetchClients, toast]);

  const filteredClients = clients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    // Lembre-se: se types.ts tem cpf_cnpj, use client.cpf_cnpj aqui. Se você atualizou types.ts para cpfCnpj, use client.cpfCnpj.
    // Usando client.cpfCnpj baseado na sua confirmação de que a coluna no DB é cpfCnpj.
    return client.nome?.toLowerCase().includes(searchTermLower) ||
           (client.email && client.email.toLowerCase().includes(searchTermLower)) ||
           (client.cpfCnpj && client.cpfCnpj.toLowerCase().includes(searchTermLower));
    }
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
    console.log("handleSaveClient: Dados do formulário recebidos:", formDataFromForm);

    // Objeto para Supabase. As chaves DEVEM corresponder aos nomes das colunas no SEU BANCO DE DADOS.
    // Se a coluna é 'cpfCnpj', use 'cpfCnpj'. Se for 'tipo_cliente', use 'tipo_cliente'.
    const dadosParaSupabase = {
      nome: formDataFromForm.nome,
      email: formDataFromForm.email,
      telefone: formDataFromForm.telefone,
      tipo_cliente: formDataFromForm.tipo, // 'tipo_cliente' conforme types.ts
      cpfCnpj: formDataFromForm.cpfCnpj,   // 'cpfCnpj' conforme sua confirmação
      endereco: formDataFromForm.endereco,
      cidade: formDataFromForm.cidade,
      estado: formDataFromForm.estado,
      cep: formDataFromForm.cep,
      observacoes: formDataFromForm.observacoes,
      status_cliente: formDataFromForm.status_cliente || 'Ativo',
    };
    console.log("handleSaveClient: Objeto sendo enviado para o Supabase:", dadosParaSupabase);

    try {
      let responseData: Cliente | null = null;
      if (isEditing && selectedClient) {
        console.log(`handleSaveClient: Atualizando cliente ID: ${selectedClient.id}`);
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
        console.log("handleSaveClient: Inserindo novo cliente.");
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ ...dadosParaSupabase, user_id: user.id }])
          .select()
          .single();
        if (error) throw error;
        responseData = data;
      }

      console.log("handleSaveClient: Resposta do Supabase (sucesso):", responseData);
      // O Realtime deve cuidar de atualizar a lista, não precisa chamar fetchClients() aqui.
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
      console.error("handleSaveClient: Erro ao salvar cliente:", error);
      let toastTitle = isEditing ? "Erro ao Atualizar Cliente" : "Erro ao Cadastrar Cliente";
      let toastDescription = error.message || "Ocorreu um erro inesperado.";

      if (error.message && error.message.includes('Já existe um cliente cadastrado com este CPF/CNPJ para sua conta.')) {
        toastDescription = error.message;
      } 
      else if (error.message && 
          error.message.toLowerCase().includes('duplicate key value violates unique constraint') &&
          (error.message.toLowerCase().includes('cpfnnpj') ||
           (error.message.toLowerCase().includes("unique constraint") && error.message.toLowerCase().includes("clientes")))) { 
        toastDescription = "Este CPF/CNPJ já está cadastrado. Por favor, verifique os dados.";
      }
      else if (error.message && error.message.toLowerCase().includes('record "new" has no field "cpfcnpj"')) {
        toastDescription = "Erro interno no trigger (campo 'cpfcnpj'). Contate o suporte.";
      }
      else if (error.message && error.message.toLowerCase().includes("could not find the column 'cpfnnpj'")) {
        toastDescription = "Erro de schema: coluna 'cpfCnpj' não encontrada como esperado. Recarregue o schema no Supabase e verifique types.ts.";
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
    console.log("handleEditClient: Editando cliente:", client);
    const formDataForEdit = {
        nome: client.nome,
        email: client.email || '',
        telefone: client.telefone || '',
        tipo: client.tipo_cliente, // Corresponde a 'tipo_cliente' em types.ts
        cpfCnpj: client.cpfCnpj || '', // Assumindo que types.ts tem 'cpfCnpj' ou você mapeia aqui
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
  };

  const handleViewClient = (client: Cliente) => {
    console.log("handleViewClient: Visualizando cliente:", client);
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleToggleStatus = async (clientToToggle: Cliente) => {
    if (!user) return;
    setIsSubmitting(true); 
    const newStatus = clientToToggle.status_cliente === "Ativo" ? "Inativo" : "Ativo";
    console.log(`handleToggleStatus: Alterando status do cliente ${clientToToggle.id} para ${newStatus}`);
    try {
      const { data: updatedClient, error } = await supabase
        .from('clientes')
        .update({ status_cliente: newStatus })
        .eq('id', clientToToggle.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      // O Realtime deve pegar essa mudança.
      if (updatedClient) {
         toast({
          title: "Status atualizado",
          description: `Cliente ${updatedClient.nome} agora está ${newStatus}.`
        });
      }
    } catch (error: any) {
      console.error("handleToggleStatus: Erro ao atualizar status:", error);
      toast({ title: "Erro ao atualizar status", description: error.message || "Ocorreu um erro.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientToDelete: Cliente) => {
    if (!user) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${clientToDelete.nome}? Esta ação não pode ser desfeita.`)) {
      setIsSubmitting(true); 
      console.log(`handleDeleteClient: Excluindo cliente ID: ${clientToDelete.id}`);
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', clientToDelete.id)
          .eq('user_id', user.id);

        if (error) throw error;
        // O Realtime deve pegar essa mudança.
        toast({
          title: "Cliente excluído",
          description: `O cliente ${clientToDelete.nome} foi excluído com sucesso.`,
        });
      } catch (error: any) {
        console.error("handleDeleteClient: Erro ao excluir cliente:", error);
        toast({ title: "Erro ao excluir", description: error.message || "Ocorreu um erro.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleManualRefresh = () => {
    console.log("handleManualRefresh: Atualização manual solicitada.");
    fetchClients(true);
  };

  console.log('ClientesPage: Renderizando. isLoading:', isLoading, 'Número de clientes no estado:', clients.length);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Clientes</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" disabled={isRefreshingManually || isLoading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingManually ? 'animate-spin' : ''}`} />
              {isRefreshingManually ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button onClick={handleAddClient} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {isLoading && !clients.length ? (
          <div className="text-center py-10 flex justify-center items-center">
             <Spinner size="lg" /> <span className="ml-2">Carregando clientes...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">CPF/CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium py-3 px-4">{client.nome}</TableCell>
                      <TableCell className="hidden md:table-cell py-3 px-4">{client.email}</TableCell>
                      <TableCell className="hidden lg:table-cell py-3 px-4">{client.telefone}</TableCell>
                      <TableCell className="py-3 px-4">{client.tipo_cliente}</TableCell>
                      <TableCell className="hidden md:table-cell py-3 px-4">{client.cpfCnpj}</TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge
                          variant={client.status_cliente === "Ativo" ? "default" : "destructive"}
                          className={client.status_cliente === "Ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                        >
                          {client.status_cliente}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Mais ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClient(client)}>
                              <Eye className="mr-2 h-4 w-4" /> Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(client)}>
                              {client.status_cliente === "Ativo" ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {isLoading ? <div className="flex justify-center items-center"><Spinner /> <span className="ml-2">Carregando...</span></div> : "Nenhum cliente cadastrado."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) {
            setSelectedClient(null);
            setIsEditing(false);
          }
          setShowForm(open);
        }}>
          <DialogContent className="max-w-2xl p-0 overflow-auto max-h-[90vh]">
            <ClienteForm
              onSave={handleSaveClient}
              onCancel={() => { setShowForm(false); setSelectedClient(null); setIsEditing(false); }}
              cliente={selectedClient}
              isEdit={isEditing}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
          <DialogContent className="max-w-lg">
            {selectedClient && (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{selectedClient.nome}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowClientDetails(false)} className="-mr-2 -mt-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {selectedClient.email || 'N/A'}</p>
                  <p><strong>Telefone:</strong> {selectedClient.telefone || 'N/A'}</p>
                  <p><strong>Tipo:</strong> {selectedClient.tipo_cliente}</p>
                  <p><strong>CPF/CNPJ:</strong> {selectedClient.cpfCnpj || 'N/A'}</p>
                  <p><strong>Endereço:</strong> {selectedClient.endereco || 'N/A'}</p>
                  <p><strong>Cidade:</strong> {selectedClient.cidade || 'N/A'}</p>
                  <p><strong>Estado:</strong> {selectedClient.estado || 'N/A'}</p>
                  <p><strong>CEP:</strong> {selectedClient.cep || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedClient.status_cliente}</p>
                  <p><strong>Observações:</strong> {selectedClient.observacoes || 'Nenhuma'}</p>
                  <p><strong>Cadastrado em:</strong> {new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowClientDetails(false);
                    handleEditClient(selectedClient);
                  }}>
                    Editar
                  </Button>
                  <Button onClick={() => setShowClientDetails(false)}>Fechar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ClientesPage;