import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DocumentoWarning from '@/components/DocumentoWarning';
import DocumentoStorageInfo from '@/components/DocumentoStorageInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Download, 
  Trash2, 
  Eye, 
  File, 
  FilePlus,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentos, DocumentType, LIMITE_ARMAZENAMENTO_BYTES } from '@/hooks/useDocumentos';

const DocumentosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('outro');
  const [clientName, setClientName] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  
  const { toast } = useToast();
  const { 
    documents, 
    isLoading, 
    isRefreshing, 
    espacoDisponivel, 
    formatarTamanhoArquivo, 
    uploadDocumento, 
    listarDocumentos,
    obterUrlDocumento,
    excluirDocumento
  } = useDocumentos();

  // Filtrar documentos com base na pesquisa e tipo
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.processo && doc.processo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || doc.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  // Manipular upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho do arquivo
      if (file.size > LIMITE_ARMAZENAMENTO_BYTES) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo excede o limite máximo de 25MB.`,
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      // Verificar se há espaço suficiente
      if (file.size > espacoDisponivel) {
        toast({
          title: "Espaço insuficiente",
          description: `Você não tem espaço suficiente. Disponível: ${formatarTamanhoArquivo(espacoDisponivel)}`,
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  // Manipular envio do formulário de upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    if (!clientName) {
      toast({
        title: "Erro no upload",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fazer upload do documento
      await uploadDocumento(
        selectedFile,
        documentType,
        clientName,
        processNumber || undefined
      );

      // Fechar diálogo e resetar campos
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentType('outro');
      setClientName('');
      setProcessNumber('');
      
      toast({
        title: "Documento enviado com sucesso",
        description: `${selectedFile.name} foi adicionado à sua biblioteca.`,
      });
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  // Formatar data
  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  // Manipular ações de documento
  const handleDocumentAction = async (action: string, document: any) => {
    switch (action) {
      case 'view':
        try {
          const url = await obterUrlDocumento(document.path);
          window.open(url, '_blank');
        } catch (error) {
          console.error('Erro ao visualizar documento:', error);
        }
        break;
        
      case 'download':
        try {
          const url = await obterUrlDocumento(document.path);
          
          // Criar um link temporário para download
          const a = document.createElement('a');
          a.href = url;
          a.download = document.nome;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          toast({
            title: "Download iniciado",
            description: `Baixando ${document.nome}`,
          });
        } catch (error) {
          console.error('Erro ao baixar documento:', error);
        }
        break;
        
      case 'delete':
        try {
          await excluirDocumento(document.id, document.path);
        } catch (error) {
          console.error('Erro ao excluir documento:', error);
        }
        break;
        
      default:
        break;
    }
  };

  // Function to fix modal display
  const openUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-gray-600">Gerencie todos os documentos do seu escritório</p>
          </div>
          <Button 
            onClick={openUploadDialog} 
            className="bg-lawyer-primary hover:bg-lawyer-primary/90"
            disabled={espacoDisponivel < 1024} // Desabilitar se menos de 1KB disponível
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar Documento
          </Button>
        </div>
        
        <DocumentoWarning />
        
        {/* Informações de armazenamento */}
        <DocumentoStorageInfo />
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar documentos por nome, cliente ou processo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {filterType === 'all' ? 'Todos os tipos' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="petição">Petição</SelectItem>
                  <SelectItem value="procuração">Procuração</SelectItem>
                  <SelectItem value="decisão">Decisão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => listarDocumentos()} 
                disabled={isRefreshing}
              >
                {isRefreshing ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>
          
          {filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-gray-500" />
                        {doc.nome}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{doc.tipo}</TableCell>
                    <TableCell>{doc.cliente}</TableCell>
                    <TableCell>{doc.processo || '-'}</TableCell>
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                    <TableCell>{formatarTamanhoArquivo(doc.tamanho_bytes)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDocumentAction('view', doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDocumentAction('download', doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDocumentAction('delete', doc)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <File className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">Nenhum documento encontrado</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || filterType !== 'all' ? 
                  'Tente ajustar seus filtros de busca' : 
                  'Comece enviando seu primeiro documento'}
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                  disabled={espacoDisponivel < 1024} // Desabilitar se menos de 1KB disponível
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Enviar documento
                </Button>
              )}
            </div>
          )}
          
          {espacoDisponivel < 1024 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center text-amber-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              <p className="text-sm">
                Você não tem espaço suficiente para enviar novos documentos. Exclua alguns documentos antigos para liberar espaço.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Enviar novo documento</DialogTitle>
            <DialogDescription>
              Faça upload de um documento e associe-o a um cliente ou processo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="file" className="text-sm font-medium">
                  Arquivo
                </label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  disabled={isLoading}
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500">
                    {selectedFile.name} ({formatarTamanhoArquivo(selectedFile.size)})
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Limite máximo: 25MB. Espaço disponível: {formatarTamanhoArquivo(espacoDisponivel)}
                </p>
              </div>
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Tipo de documento
                </label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="petição">Petição</SelectItem>
                    <SelectItem value="procuração">Procuração</SelectItem>
                    <SelectItem value="decisão">Decisão</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="client" className="text-sm font-medium">
                  Cliente
                </label>
                <Input
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="process" className="text-sm font-medium">
                  Número do processo (opcional)
                </label>
                <Input
                  id="process"
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Ex: 0001234-56.2023.8.26.0000"
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? "Enviando..." : "Enviar documento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DocumentosPage;
