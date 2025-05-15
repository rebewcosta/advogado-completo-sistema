
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
  FileText,
  MoreVertical,
  File,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock data for processos
const mockProcessos = [
  { id: 1, numero: "0001234-56.2023.8.26.0100", cliente: "João Silva", tipo: "Cível", vara: "3ª Vara Cível", status: "Em andamento", prazo: "10/06/2025" },
  { id: 2, numero: "0007890-12.2023.8.26.0100", cliente: "Maria Oliveira", tipo: "Trabalhista", vara: "5ª Vara do Trabalho", status: "Concluído", prazo: "Finalizado" },
  { id: 3, numero: "0002345-67.2023.8.26.0100", cliente: "Empresa ABC Ltda", tipo: "Tributário", vara: "2ª Vara de Execuções Fiscais", status: "Em andamento", prazo: "15/07/2025" },
  { id: 4, numero: "0008901-23.2023.8.26.0100", cliente: "Carlos Pereira", tipo: "Criminal", vara: "1ª Vara Criminal", status: "Suspenso", prazo: "Suspenso" },
  { id: 5, numero: "0003456-78.2023.8.26.0100", cliente: "Empresa XYZ S.A.", tipo: "Cível", vara: "4ª Vara Cível", status: "Em andamento", prazo: "22/08/2025" },
  { id: 6, numero: "0009012-34.2023.8.26.0100", cliente: "Ana Souza", tipo: "Família", vara: "2ª Vara de Família", status: "Em andamento", prazo: "30/06/2025" },
  { id: 7, numero: "0004567-89.2023.8.26.0100", cliente: "Roberto Costa", tipo: "Trabalhista", vara: "3ª Vara do Trabalho", status: "Concluído", prazo: "Finalizado" },
  { id: 8, numero: "0000123-45.2023.8.26.0100", cliente: "Consultoria Legal Ltda", tipo: "Tributário", vara: "1ª Vara de Execuções Fiscais", status: "Em andamento", prazo: "05/09/2025" },
];

const andamentos = [
  { id: 1, processoId: 1, data: "15/05/2023", descricao: "Petição inicial protocolada", responsavel: "Dr. Silva" },
  { id: 2, processoId: 1, data: "20/05/2023", descricao: "Despacho inicial", responsavel: "Juiz" },
  { id: 3, processoId: 1, data: "01/06/2023", descricao: "Citação realizada", responsavel: "Oficial de Justiça" },
  { id: 4, processoId: 1, data: "15/06/2023", descricao: "Contestação apresentada", responsavel: "Parte contrária" },
  { id: 5, processoId: 1, data: "30/06/2023", descricao: "Réplica protocolada", responsavel: "Dr. Silva" },
  { id: 6, processoId: 1, data: "15/07/2023", descricao: "Despacho - Especificar provas", responsavel: "Juiz" },
  { id: 7, processoId: 1, data: "30/07/2023", descricao: "Manifestação sobre provas", responsavel: "Dr. Silva" },
  { id: 8, processoId: 1, data: "15/08/2023", descricao: "Designação de audiência", responsavel: "Juiz" }
];

const ProcessosPage = () => {
  const [processos, setProcessos] = useState(mockProcessos);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAndamentoModalOpen, setIsAndamentoModalOpen] = useState(false);
  const [currentProcesso, setCurrentProcesso] = useState<any>(null);
  const { toast } = useToast();
  
  const filteredProcessos = processos.filter(processo =>
    processo.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProcesso = (processo: any) => {
    setCurrentProcesso(processo);
    setIsModalOpen(true);
  };

  const handleViewAndamentos = (processo: any) => {
    setCurrentProcesso(processo);
    setIsAndamentoModalOpen(true);
  };

  const handleDeleteProcesso = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este processo?")) {
      setProcessos(processos.filter(processo => processo.id !== id));
      toast({
        title: "Processo excluído",
        description: "O processo foi removido com sucesso.",
      });
    }
  };

  const handleAddOrUpdateProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const processoData = Object.fromEntries(formData.entries());
    
    if (currentProcesso) {
      // Update existing processo
      setProcessos(processos.map(processo => 
        processo.id === currentProcesso.id ? {...processo, ...processoData, id: processo.id} : processo
      ));
      toast({
        title: "Processo atualizado",
        description: "As informações do processo foram atualizadas com sucesso.",
      });
    } else {
      // Add new processo
      setProcessos([...processos, {
        ...processoData,
        id: processos.length + 1
      }]);
      toast({
        title: "Processo adicionado",
        description: "O novo processo foi adicionado com sucesso.",
      });
    }
    
    setIsModalOpen(false);
    setCurrentProcesso(null);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Suspenso':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Processos Jurídicos</h1>
              <p className="text-gray-600">Gerencie todos os seus processos e acompanhe seus andamentos</p>
            </div>
            <button 
              onClick={() => {
                setCurrentProcesso(null);
                setIsModalOpen(true);
              }} 
              className="btn-primary"
            >
              <FileText className="h-5 w-5 mr-1" />
              Novo Processo
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por número ou cliente..."
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
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vara</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próximo Prazo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProcessos.length > 0 ? (
                    filteredProcessos.map((processo) => (
                      <tr key={processo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{processo.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{processo.cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{processo.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{processo.vara}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(processo.status)}`}>
                            {processo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {processo.prazo !== "Finalizado" && processo.prazo !== "Suspenso" ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                              {processo.prazo}
                            </div>
                          ) : (
                            processo.prazo
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleViewAndamentos(processo)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                              title="Ver andamentos"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditProcesso(processo)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                              title="Editar processo"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProcesso(processo.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                              title="Excluir processo"
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
                        Nenhum processo encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredProcessos.length}</span> de <span className="font-medium">{processos.length}</span> processos
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
      
      {/* Modal para adicionar/editar processo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentProcesso ? 'Editar Processo' : 'Novo Processo'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentProcesso(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateProcesso}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número do Processo</label>
                  <input 
                    type="text" 
                    id="numero" 
                    name="numero" 
                    defaultValue={currentProcesso?.numero || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input 
                    type="text" 
                    id="cliente" 
                    name="cliente" 
                    defaultValue={currentProcesso?.cliente || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                      id="tipo" 
                      name="tipo" 
                      defaultValue={currentProcesso?.tipo || ''}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="Cível">Cível</option>
                      <option value="Criminal">Criminal</option>
                      <option value="Trabalhista">Trabalhista</option>
                      <option value="Tributário">Tributário</option>
                      <option value="Família">Família</option>
                      <option value="Administrativo">Administrativo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vara" className="block text-sm font-medium text-gray-700 mb-1">Vara</label>
                    <input 
                      type="text" 
                      id="vara" 
                      name="vara" 
                      defaultValue={currentProcesso?.vara || ''}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      defaultValue={currentProcesso?.status || 'Em andamento'}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="prazo" className="block text-sm font-medium text-gray-700 mb-1">Próximo Prazo</label>
                    <input 
                      type="text" 
                      id="prazo" 
                      name="prazo" 
                      defaultValue={currentProcesso?.prazo || ''}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentProcesso(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {currentProcesso ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para visualizar andamentos */}
      {isAndamentoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Andamentos do Processo</h3>
              <button 
                onClick={() => {
                  setIsAndamentoModalOpen(false);
                  setCurrentProcesso(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número do Processo</p>
                  <p className="font-medium">{currentProcesso?.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cliente</p>
                  <p className="font-medium">{currentProcesso?.cliente}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p>{currentProcesso?.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vara</p>
                  <p>{currentProcesso?.vara}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p><span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(currentProcesso?.status)}`}>{currentProcesso?.status}</span></p>
                </div>
              </div>
            </div>
            <div className="overflow-y-auto flex-grow">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Histórico de Andamentos</h4>
                  <button className="px-4 py-2 bg-lawyer-primary text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Novo Andamento
                  </button>
                </div>
                <div className="relative pl-8 before:content-[''] before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {andamentos.map((andamento, index) => (
                    <div key={andamento.id} className="mb-6 relative">
                      <div className="absolute -left-8 top-0 rounded-full bg-lawyer-primary w-4 h-4"></div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{andamento.descricao}</p>
                            <p className="text-sm text-gray-500">Responsável: {andamento.responsavel}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{andamento.data}</span>
                            <button className="p-1 hover:bg-gray-100 rounded-full">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="mt-3 flex gap-2">
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-1">
                              <File className="h-3 w-3" /> Petição.pdf
                            </button>
                            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center gap-1">
                              <File className="h-3 w-3" /> Despacho.pdf
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button 
                onClick={() => {
                  setIsAndamentoModalOpen(false);
                  setCurrentProcesso(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default ProcessosPage;
