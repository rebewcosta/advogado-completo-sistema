import React, { useState, useEffect } from 'react';
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
import { X, Edit, Eye, UserPlus, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from '@/components/AdminLayout';

const ClientesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  
  // Inicializando com array vazio - persistindo usando localStorage
  const [clients, setClients] = useState<any[]>(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : [];
  });

  // Efeito para atualizar localStorage quando os clientes mudam
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpfCnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSaveClient = (clientData: any) => {
    if (isEditing && selectedClient) {
      // Update existing client
      setClients(prev => 
        prev.map(client => 
          client.id === selectedClient.id 
            ? { ...client, ...clientData, id: client.id } 
            : client
        )
      );
    } else {
      // Add new client
      const newClient = {
        ...clientData,
        id: Date.now(), // Usar timestamp para garantir IDs únicos
        processos: 0,
        status: "Ativo"
      };
      setClients(prev => [...prev, newClient]);
    }
    setShowForm(false);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const handleToggleStatus = (id: number) => {
    setClients(prev => 
      prev.map(client => 
        client.id === id 
          ? { ...client, status: client.status === "Ativo" ? "Inativo" : "Ativo" } 
          : client
      )
    );
    
    const client = clients.find(client => client.id === id);
    const newStatus = client?.status === "Ativo" ? "Inativo" : "Ativo";
    
    toast({
      title: "Status atualizado",
      description: `Cliente ${client?.nome} agora está ${newStatus}.`
    });
  };

  const handleDeleteClient = (id: number) => {
    const client = clients.find(client => client.id === id);
    
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${client?.nome}?`)) {
      setClients(prev => prev.filter(client => client.id !== id));
      
      toast({
        title: "Cliente excluído",
        description: `O cliente ${client?.nome} foi excluído com sucesso.`,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Clientes</h1>
        
        {/* Search and Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <Button onClick={handleAddClient}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
        
        {/* Client List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Processos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.nome}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telefone}</TableCell>
                    <TableCell>{client.tipo}</TableCell>
                    <TableCell>{client.cpfCnpj}</TableCell>
                    <TableCell>{client.processos}</TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${client.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        `}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(client.id)}
                        >
                          {client.status === "Ativo" ? "Desativar" : "Ativar"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum cliente cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Client Form Dialog - Fixed for proper rendering */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl p-0 overflow-auto max-h-[90vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <ClienteForm 
            onSave={handleSaveClient}
            onCancel={() => setShowForm(false)}
            cliente={selectedClient}
            isEdit={isEditing}
          />
        </DialogContent>
      </Dialog>
      
      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-3xl p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {selectedClient && (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedClient.nome}</h2>
                  <Badge
                    className={`
                      mt-2 ${selectedClient.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    `}
                  >
                    {selectedClient.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowClientDetails(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tipo de Cliente</h3>
                    <p>{selectedClient.tipo}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">CPF/CNPJ</h3>
                    <p>{selectedClient.cpfCnpj}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{selectedClient.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                    <p>{selectedClient.telefone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                    <p>{selectedClient.endereco}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cidade/Estado</h3>
                    <p>{selectedClient.cidade}/{selectedClient.estado} - CEP: {selectedClient.cep}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Processos Ativos</h3>
                    <p>{selectedClient.processos}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                <p className="mt-1">{selectedClient.observacoes || "Nenhuma observação cadastrada."}</p>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => {
                  setShowClientDetails(false);
                  handleEditClient(selectedClient);
                }}>
                  Editar Cliente
                </Button>
                <Button onClick={() => setShowClientDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ClientesPage;
