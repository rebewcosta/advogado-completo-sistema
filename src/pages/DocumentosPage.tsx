// src/pages/DocumentosPage.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DocumentoWarning from '@/components/DocumentoWarning';
import DocumentoStorageInfo from '@/components/DocumentoStorageInfo';
// Removido DocumentHeader pois o cabeçalho será refeito aqui
import DocumentSearchBar from '@/components/documentos/DocumentSearchBar';
import DocumentListAsCards from '@/components/documentos/DocumentListAsCards'; // <<< NOVO COMPONENTE DE LISTA
import DocumentUploadDialog from '@/components/documentos/DocumentUploadDialog';
import DocumentError from '@/components/documentos/DocumentError';
import LowStorageWarning from '@/components/documentos/LowStorageWarning';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { FileArchive, Plus, Upload } from 'lucide-react'; // Ícone para o cabeçalho e botão
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const DocumentosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { 
    documents, 
    isLoading, 
    isRefreshing, 
    espacoDisponivel, 
    listarDocumentos,
    calcularEspacoDisponivel,
    error
  } = useDocumentos();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Não precisa de setIsLoading(true) aqui, useDocumentos já lida com isso
        await listarDocumentos();
        await calcularEspacoDisponivel();
      } catch (err) {
        console.error('Erro inicial ao carregar documentos na DocumentosPage:', err);
      }
      // setIsLoading(false) também é tratado por useDocumentos
    };
    
    fetchData();
  }, [listarDocumentos, calcularEspacoDisponivel]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.processo && doc.processo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || doc.tipo === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleRefresh = async () => {
    try {
      await listarDocumentos();
      await calcularEspacoDisponivel();
      toast({
        title: "Dados atualizados",
        description: "Os documentos foram atualizados com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao atualizar dados na DocumentosPage:', err);
    }
  };
  
  const isLoadingCombined = isLoading || isRefreshing;

  if (isLoading && documents.length === 0 && !isRefreshing) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando documentos...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
              <FileArchive className="mr-3 h-7 w-7 text-lawyer-primary" />
              Gestão de Documentos
            </h1>
            <p className="text-gray-600 text-left mt-1">
              Organize e acesse os arquivos importantes do seu escritório.
            </p>
          </div>
           <Button 
              onClick={() => setIsUploadDialogOpen(true)} 
              className="mt-4 md:mt-0 w-full md:w-auto bg-lawyer-primary hover:bg-lawyer-primary/90 text-white"
              disabled={isLoadingCombined || espacoDisponivel < 1024}
            >
              <Upload className="h-4 w-4 mr-2" />
              Enviar Documento
            </Button>
        </div>
        
        <DocumentoWarning />
        <DocumentoStorageInfo />
        
        {/* Card para Barra de Ações */}
        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
            <CardContent className="p-4">
                 <DocumentSearchBar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    handleRefresh={handleRefresh}
                    isRefreshing={isRefreshing} // Passando o isRefreshing correto
                />
            </CardContent>
        </Card>

        <DocumentError error={error} /> 
        
        <DocumentListAsCards
            documents={filteredDocuments}
            isLoading={isLoadingCombined} // Passando o estado de loading principal
            searchTerm={searchTerm}
            filterType={filterType}
            onRefresh={handleRefresh} // Passar a função de refresh
            onUploadClick={() => setIsUploadDialogOpen(true)} // Para o botão dentro da lista vazia
            error={error} // Para exibir erro dentro da lista, se necessário
        />
        
        <LowStorageWarning espacoDisponivel={espacoDisponivel} />
      </div>
      
      <DocumentUploadDialog 
        isOpen={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen}
      />
    </AdminLayout>
  );
};

export default DocumentosPage;