// src/pages/DocumentosPage.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DocumentoWarning from '@/components/DocumentoWarning';
import DocumentoStorageInfo from '@/components/DocumentoStorageInfo';
import DocumentSearchBar from '@/components/documentos/DocumentSearchBar';
import DocumentListAsCards from '@/components/documentos/DocumentListAsCards';
import DocumentTable from '@/components/documentos/DocumentTable';
import DocumentUploadDialog from '@/components/documentos/DocumentUploadDialog';
import DocumentError from '@/components/documentos/DocumentError';
import LowStorageWarning from '@/components/documentos/LowStorageWarning';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { FileArchive, Upload } from 'lucide-react'; // FileArchive para o header
import { Spinner } from '@/components/ui/spinner';
import SharedPageHeader from '@/components/shared/SharedPageHeader'; // <<< IMPORTAR

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
        await listarDocumentos();
        await calcularEspacoDisponivel();
      } catch (err) {
        console.error('Erro inicial ao carregar documentos na DocumentosPage:', err);
      }
    };
    
    fetchData();
  }, [listarDocumentos, calcularEspacoDisponivel]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = (doc.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.processo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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

  if (isLoadingCombined && documents.length === 0 && !isRefreshing) {
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
        <SharedPageHeader
            title="Gestão de Documentos"
            description="Organize e acesse os arquivos importantes do seu escritório."
            pageIcon={<FileArchive />}
            actionButtonText="Enviar Documento"
            onActionButtonClick={() => setIsUploadDialogOpen(true)}
            isLoading={isLoadingCombined}
            actionButtonDisabled={espacoDisponivel < 1024} // Desabilita se não houver espaço
            actionButtonIcon={<Upload className="h-4 w-4 mr-2"/>}
        />
        
        <DocumentoWarning />
        <DocumentoStorageInfo />
        
        <DocumentSearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          handleRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <DocumentError error={error} /> 
        
        <div className="hidden md:block">
            <DocumentTable
                documents={filteredDocuments}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
                filterType={filterType}
                onRefresh={handleRefresh}
                onUploadClick={() => setIsUploadDialogOpen(true)}
                error={error}
            />
        </div>
        <div className="md:hidden">
            <DocumentListAsCards
                documents={filteredDocuments}
                isLoading={isLoadingCombined}
                searchTerm={searchTerm}
                filterType={filterType}
                onRefresh={handleRefresh}
                onUploadClick={() => setIsUploadDialogOpen(true)}
                error={error}
            />
        </div>
        
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
