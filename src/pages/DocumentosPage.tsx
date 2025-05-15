
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  FolderPlus,
  Folder,
  File,
  Download,
  Share2,
  MoreVertical,
  Grid,
  List,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock data for folders and files
const mockFolders = [
  { id: 1, nome: "Contratos", quantidadeArquivos: 15, criadoEm: "2023-05-10" },
  { id: 2, nome: "Processos Ativos", quantidadeArquivos: 23, criadoEm: "2023-05-12" },
  { id: 3, nome: "Processos Concluídos", quantidadeArquivos: 8, criadoEm: "2023-05-15" },
  { id: 4, nome: "Documentos Administrativos", quantidadeArquivos: 7, criadoEm: "2023-05-18" },
];

const mockDocumentos = [
  { id: 1, nome: "Contrato_João_Silva.pdf", tipo: "PDF", tamanho: "2.5 MB", criadoEm: "2023-06-10", cliente: "João Silva", categoria: "Contrato" },
  { id: 2, nome: "Petição_Inicial_Empresa_ABC.docx", tipo: "DOCX", tamanho: "1.8 MB", criadoEm: "2023-06-05", cliente: "Empresa ABC Ltda", categoria: "Petição" },
  { id: 3, nome: "Procuração_Maria_Oliveira.pdf", tipo: "PDF", tamanho: "0.7 MB", criadoEm: "2023-06-12", cliente: "Maria Oliveira", categoria: "Procuração" },
  { id: 4, nome: "Relatório_Financeiro_Maio.xlsx", tipo: "XLSX", tamanho: "4.2 MB", criadoEm: "2023-06-02", cliente: "", categoria: "Administrativo" },
  { id: 5, nome: "Recurso_Apelação_Roberto.docx", tipo: "DOCX", tamanho: "3.1 MB", criadoEm: "2023-06-15", cliente: "Roberto Costa", categoria: "Recurso" },
  { id: 6, nome: "Comprovante_Pagamento_Custas.pdf", tipo: "PDF", tamanho: "0.5 MB", criadoEm: "2023-06-08", cliente: "", categoria: "Financeiro" },
  { id: 7, nome: "Sentença_Processo_12345.pdf", tipo: "PDF", tamanho: "2.3 MB", criadoEm: "2023-06-14", cliente: "João Silva", categoria: "Sentença" },
  { id: 8, nome: "Ata_Reunião_Sócios.pdf", tipo: "PDF", tamanho: "1.1 MB", criadoEm: "2023-06-09", cliente: "Empresa ABC Ltda", categoria: "Ata" },
];

const DocumentosPage = () => {
  const [documentos, setDocumentos] = useState(mockDocumentos);
  const [folders, setFolders] = useState(mockFolders);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const { toast } = useToast();
  
  const filteredDocumentos = documentos.filter(documento =>
    documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    documento.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    documento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDocument = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      setDocumentos(documentos.filter(documento => documento.id !== id));
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso.",
      });
    }
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const documentData = Object.fromEntries(formData.entries()) as any;
    
    // Add new document
    setDocumentos([...documentos, {
      ...documentData,
      id: documentos.length + 1,
      tamanho: "0.0 MB", // This would be determined by the actual file in a real app
      criadoEm: new Date().toISOString().split('T')[0]
    }]);
    
    toast({
      title: "Documento adicionado",
      description: "O novo documento foi adicionado com sucesso.",
    });
    
    setIsModalOpen(false);
  };

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const folderData = Object.fromEntries(formData.entries()) as any;
    
    // Add new folder
    setFolders([...folders, {
      nome: folderData.nome,
      id: folders.length + 1,
      quantidadeArquivos: 0,
      criadoEm: new Date().toISOString().split('T')[0]
    }]);
    
    toast({
      title: "Pasta criada",
      description: "A nova pasta foi criada com sucesso.",
    });
    
    setIsFolderModalOpen(false);
  };

  const getIconByFileType = (tipo: string) => {
    switch(tipo) {
      case 'PDF':
        return <File className="h-6 w-6 text-red-500" />;
      case 'DOCX':
        return <File className="h-6 w-6 text-blue-500" />;
      case 'XLSX':
        return <File className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Documentos</h1>
              <p className="text-gray-600">Armazene e organize todos os seus documentos</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFolderModalOpen(true)} 
                className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <FolderPlus className="h-5 w-5" />
                Nova Pasta
              </button>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-1" />
                Novo Documento
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
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
                <div className="flex rounded-md shadow-sm">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} rounded-l-md border`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} rounded-r-md border-t border-r border-b`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Navigation Path */}
            <div className="flex items-center p-4 text-sm">
              <button 
                onClick={() => setCurrentPath([])} 
                className="text-lawyer-primary hover:underline"
              >
                Documentos
              </button>
              {currentPath.map((folder, index) => (
                <div key={index} className="flex items-center">
                  <span className="mx-2">/</span>
                  <button 
                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                    className="text-lawyer-primary hover:underline"
                  >
                    {folder}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="p-4">
                {currentPath.length === 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Pastas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {folders.map(folder => (
                        <div 
                          key={folder.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center"
                          onClick={() => setCurrentPath([...currentPath, folder.nome])}
                        >
                          <Folder className="h-12 w-12 text-yellow-500 mb-2" />
                          <h4 className="font-medium text-center">{folder.nome}</h4>
                          <p className="text-xs text-gray-500">{folder.quantidadeArquivos} arquivos</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <h3 className="text-lg font-semibold mb-4">Arquivos</h3>
                {filteredDocumentos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDocumentos.map(documento => (
                      <div 
                        key={documento.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-grow">
                            {getIconByFileType(documento.tipo)}
                          </div>
                          <div className="dropdown">
                            <button className="p-1 hover:bg-gray-100 rounded-full">
                              <MoreVertical className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm mb-1" title={documento.nome}>
                          {documento.nome.length > 20 ? documento.nome.substring(0, 20) + '...' : documento.nome}
                        </h4>
                        <div className="flex flex-wrap gap-y-1 gap-x-2 mt-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">{documento.tipo}</span>
                          <span>{documento.tamanho}</span>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-gray-500">{new Date(documento.criadoEm).toLocaleDateString('pt-BR')}</span>
                          <div className="flex gap-1">
                            <button 
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              title="Compartilhar"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                              title="Excluir"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(documento.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <File className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Nenhum documento encontrado</p>
                    {searchTerm && (
                      <p className="text-sm mt-2">Tente ajustar os filtros ou termo de busca</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto">
                {currentPath.length === 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold mb-4">Pastas</h3>
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {folders.map(folder => (
                          <tr 
                            key={folder.id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setCurrentPath([...currentPath, folder.nome])}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Folder className="h-5 w-5 text-yellow-500 mr-2" />
                                <span className="font-medium">{folder.nome}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{folder.quantidadeArquivos} arquivos</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(folder.criadoEm).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button className="p-1 hover:bg-gray-100 rounded-full">
                                <MoreVertical className="h-5 w-5 text-gray-500" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Arquivos</h3>
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocumentos.length > 0 ? (
                        filteredDocumentos.map(documento => (
                          <tr key={documento.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getIconByFileType(documento.tipo)}
                                <span className="ml-2">{documento.nome}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{documento.tipo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{documento.tamanho}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{documento.cliente || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{documento.categoria}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(documento.criadoEm).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end gap-1">
                                <button 
                                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                                <button 
                                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                  title="Compartilhar"
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>
                                <button 
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded"
                                  title="Excluir"
                                  onClick={() => handleDeleteDocument(documento.id)}
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
                            Nenhum documento encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredDocumentos.length}</span> de <span className="font-medium">{documentos.length}</span> documentos
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
      
      {/* Modal para adicionar novo documento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Novo Documento</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddDocument}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do arquivo</label>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select 
                      id="tipo" 
                      name="tipo" 
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                      <option value="JPG">JPG</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select 
                      id="categoria" 
                      name="categoria" 
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="Contrato">Contrato</option>
                      <option value="Petição">Petição</option>
                      <option value="Procuração">Procuração</option>
                      <option value="Sentença">Sentença</option>
                      <option value="Recurso">Recurso</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                  <input 
                    type="text" 
                    id="cliente" 
                    name="cliente" 
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <input type="file" className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                          <Plus className="h-6 w-6" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="text-lawyer-primary">Clique para fazer upload</span> ou arraste e solte
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOCX, XLSX até 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para adicionar nova pasta */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Nova Pasta</h3>
              <button 
                onClick={() => setIsFolderModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddFolder}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome da pasta</label>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar
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

export default DocumentosPage;
