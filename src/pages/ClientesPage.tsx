
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  UserPlus,
  Users
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock data for clients
const mockClients = [
  { id: 1, nome: "João Silva", email: "joao.silva@email.com", telefone: "(11) 98765-4321", tipo: "Pessoa Física", processos: 3, status: "Ativo" },
  { id: 2, nome: "Maria Oliveira", email: "maria.oliveira@email.com", telefone: "(11) 91234-5678", tipo: "Pessoa Física", processos: 1, status: "Ativo" },
  { id: 3, nome: "Empresa ABC Ltda", email: "contato@empresaabc.com", telefone: "(11) 3456-7890", tipo: "Pessoa Jurídica", processos: 5, status: "Ativo" },
  { id: 4, nome: "Carlos Pereira", email: "carlos.pereira@email.com", telefone: "(11) 99876-5432", tipo: "Pessoa Física", processos: 0, status: "Inativo" },
  { id: 5, nome: "Empresa XYZ S.A.", email: "juridico@empresaxyz.com", telefone: "(11) 2345-6789", tipo: "Pessoa Jurídica", processos: 2, status: "Ativo" },
  { id: 6, nome: "Ana Souza", email: "ana.souza@email.com", telefone: "(11) 97654-3210", tipo: "Pessoa Física", processos: 1, status: "Ativo" },
  { id: 7, nome: "Roberto Costa", email: "roberto.costa@email.com", telefone: "(11) 98765-1234", tipo: "Pessoa Física", processos: 2, status: "Ativo" },
  { id: 8, nome: "Consultoria Legal Ltda", email: "contato@consultorialegal.com", telefone: "(11) 3456-1234", tipo: "Pessoa Jurídica", processos: 4, status: "Ativo" },
];

const ClientesPage = () => {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<any>(null);
  const { toast } = useToast();
  
  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: any) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients(clients.filter(client => client.id !== id));
      toast({
        title: "Cliente excluído",
        description: "O cliente foi removido com sucesso.",
      });
    }
  };

  const handleAddOrUpdateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const clientData = Object.fromEntries(formData.entries());
    
    if (currentClient) {
      // Update existing client
      setClients(clients.map(client => 
        client.id === currentClient.id ? {...client, ...clientData, id: client.id} : client
      ));
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
    } else {
      // Add new client
      setClients([...clients, {
        ...clientData,
        id: clients.length + 1,
        processos: 0,
        status: "Ativo"
      }]);
      toast({
        title: "Cliente adicionado",
        description: "O novo cliente foi adicionado com sucesso.",
      });
    }
    
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
              <p className="text-gray-600">Gerencie todos os seus clientes em um só lugar</p>
            </div>
            <button 
              onClick={() => {
                setCurrentClient(null);
                setIsModalOpen(true);
              }} 
              className="btn-primary"
            >
              <UserPlus className="h-5 w-5 mr-1" />
              Novo Cliente
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Filtrar
                </button>
                <button className="btn-primary">
                  <Users className="h-5 w-5 mr-1" />
                  Importar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{client.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{client.telefone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{client.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{client.processos}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${client.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEditClient(client)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClient(client.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredClients.length}</span> de <span className="font-medium">{clients.length}</span> clientes
              </div>
              <div className="flex gap-2">
                <button className="p-2 border rounded-md hover:bg-gray-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 border rounded-md hover:bg-gray-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal para adicionar/editar cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentClient(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateClient}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    defaultValue={currentClient?.nome || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    defaultValue={currentClient?.email || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="text" 
                    id="telefone" 
                    name="telefone" 
                    defaultValue={currentClient?.telefone || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select 
                    id="tipo" 
                    name="tipo" 
                    defaultValue={currentClient?.tipo || 'Pessoa Física'}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  >
                    <option value="Pessoa Física">Pessoa Física</option>
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentClient(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {currentClient ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ClientesPage;
