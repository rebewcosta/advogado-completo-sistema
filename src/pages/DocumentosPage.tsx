import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DocumentoWarning from '@/components/DocumentoWarning';
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
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  File, 
  FilePlus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipos para documentos
type DocumentType = 'contrato' | 'petição' | 'procuração' | 'decisão' | 'outro';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  client: string;
  process?: string;
  createdAt: Date;
  size: string;
}

const DocumentosPage = () => {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('outro');
  const [clientName, setClientName] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  
  const { toast } = useToast();

  // Filtrar documentos com base na pesquisa e tipo
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.process && doc.process.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === '' || doc.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Manipular upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Manipular envio do formulário de upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    // Criar novo documento
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      name: selectedFile.name,
      type: documentType,
      client: clientName,
      process: processNumber || undefined,
      createdAt: new Date(),
      size: formatFileSize(selectedFile.size),
    };

    setDocuments([newDocument, ...documents]);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setDocumentType('outro');
    setClientName('');
    setProcessNumber('');

    toast({
      title: "Documento enviado com sucesso",
      description: `${selectedFile.name} foi adicionado à sua biblioteca.`,
    });
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Manipular ações de documento
  const handleDocumentAction = (action: string, document: Document) => {
    switch (action) {
      case 'view':
        toast({
          title: "Visualizando documento",
          description: `Abrindo ${document.name}`,
        });
        break;
      case 'download':
        toast({
          title: "Download iniciado",
          description: `Baixando ${document.name}`,
        });
        break;
      case 'delete':
        setDocuments(documents.filter(doc => doc.id !== document.id));
        toast({
          title: "Documento excluído",
          description: `${document.name} foi removido da sua biblioteca.`,
        });
        break;
      default:
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Documentos</h1>
            <p className="text-gray-600">Gerencie todos os documentos do seu escritório</p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)} className="bg-lawyer-primary hover:bg-lawyer-primary/90">
            <Upload className="mr-2 h-4 w-4" />
            Enviar Documento
          </Button>
        </div>
        
        <DocumentoWarning />
        
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
                    {filterType ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'Todos os tipos'}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="petição">Petição</SelectItem>
                  <SelectItem value="procuração">Procuração</SelectItem>
                  <SelectItem value="decisão">Decisão</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{doc.type}</TableCell>
                    <TableCell>{doc.client}</TableCell>
                    <TableCell>{doc.process || '-'}</TableCell>
                    <TableCell>{formatDate(doc.createdAt)}</TableCell>
                    <TableCell>{doc.size}</TableCell>
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
                {searchTerm || filterType ? 
                  'Tente ajustar seus filtros de busca' : 
                  'Comece enviando seu primeiro documento'}
              </p>
              {!searchTerm && !filterType && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Enviar documento
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Upload */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Tipo de documento
                </label>
                <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Enviar documento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

// Dados de exemplo
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'Contrato de Prestação de Serviços - Empresa ABC.pdf',
    type: 'contrato',
    client: 'Empresa ABC Ltda',
    process: '0012345-67.2023.8.26.0000',
    createdAt: new Date('2023-06-10'),
    size: '1.2 MB',
  },
  {
    id: 'doc-2',
    name: 'Petição Inicial - João Silva.docx',
    type: 'petição',
    client: 'João Silva',
    process: '0023456-78.2023.8.26.0000',
    createdAt: new Date('2023-06-12'),
    size: '845 KB',
  },
  {
    id: 'doc-3',
    name: 'Procuração - Maria Oliveira.pdf',
    type: 'procuração',
    client: 'Maria Oliveira',
    createdAt: new Date('2023-06-15'),
    size: '320 KB',
  },
  {
    id: 'doc-4',
    name: 'Decisão Judicial - Caso Empresa XYZ.pdf',
    type: 'decisão',
    client: 'Empresa XYZ S.A.',
    process: '0034567-89.2023.8.26.0000',
    createdAt: new Date('2023-06-18'),
    size: '1.5 MB',
  },
  {
    id: 'doc-5',
    name: 'Contrato Social - Empresa ABC.pdf',
    type: 'contrato',
    client: 'Empresa ABC Ltda',
    createdAt: new Date('2023-06-20'),
    size: '2.1 MB',
  },
  {
    id: 'doc-6',
    name: 'Recurso de Apelação - Caso Silva.docx',
    type: 'petição',
    client: 'João Silva',
    process: '0012345-67.2023.8.26.0000',
    createdAt: new Date('2023-06-22'),
    size: '930 KB',
  },
];

export default DocumentosPage;
