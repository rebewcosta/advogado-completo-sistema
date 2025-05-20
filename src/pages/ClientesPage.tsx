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
import { X, Edit, Eye, Plus, Search, MoreVertical, Trash2 } from 'lucide-react';
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

  const fetchClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.cpf_cnpj && client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase()))
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
      cpf_cnpj: formDataFromForm.cpfCnpj,
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
        
        if (error) throw error; // O erro já virá com a mensagem do trigger, se aplicável
        responseData = data;
      } else {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ ...dadosParaSupabase, user_id: user.id }])
          .select()
          .single();
        
        if (error) throw error; // O erro já virá com a mensagem do trigger, se aplicável
        responseData = data;
      }

      // Se chegou aqui, a operação foi bem-sucedida
      if (responseData) {
        if (isEditing) {
          setClients(prevClients => prevClients.map(c => c.id === responseData!.id ? responseData : c));
          toast({ title: "Cliente atualizado!", description: `Os dados de ${responseData.nome} foram atualizados.` });
        } else {
          setClients(prevClients => [responseData, ...prevClients].sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "")));
          toast({ title: "Cliente cadastrado!", description: `${responseData.nome} foi salvo com sucesso.` });
        }
        setShowForm(false);
        setSelectedClient(null);
        setIsEditing(false);
      }
    } catch (error: any) { 
      // Agora, error.message já deve conter a mensagem personalizada do trigger
      // em caso de duplicidade de CPF/CNPJ, ou a mensagem padrão do Supabase para outros erros.
      console.error("Erro ao salvar cliente:", error);
      toast({
        title: isEditing ? "Erro ao Atualizar Cliente" : "Erro ao Cadastrar Cliente",
        description: error.message || "Ocorreu um erro inesperado.", // error.message será nossa mensagem customizada
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (o restante do código de ClientesPage.tsx, como handleEditClient, handleViewClient, etc., permanece o mesmo) ...

 const handleEditClient = (client: Cliente) => {
    const formDataForEdit = {
        nome: client.nome,
        email: client.email || '',
        telefone: client.telefone || '',
        tipo: client.tipo_cliente,
        cpfCnpj: client.cpf_cnpj || '',
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
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleToggleStatus = async (clientToToggle: Cliente) => {
    if (!user) return;
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
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
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

  const handleDeleteClient = async (clientToDelete: Cliente) => {
    if (!user) return;
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${clientToDelete.nome}? Esta ação não pode ser desfeita.`)) {
      setIsSubmitting(true); 
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', clientToDelete.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setClients(prev => prev.filter(client => client.id !== clientToDelete.id));
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
                      <TableCell className="hidden md:table-cell py-3 px-4">{client.cpf_cnpj}</TableCell>
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
                  <p><strong>CPF/CNPJ:</strong> {selectedClient.cpf_cnpj || 'N/A'}</p>
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