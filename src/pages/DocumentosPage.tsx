// src/pages/DocumentosPage.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DocumentoWarning from '@/components/DocumentoWarning';
import DocumentoStorageInfo from '@/components/DocumentoStorageInfo';
import DocumentHeader from '@/components/documentos/DocumentHeader';
import DocumentSearchBar from '@/components/documentos/DocumentSearchBar';
import DocumentList from '@/components/documentos/DocumentList';
import DocumentUploadDialog from '@/components/documentos/DocumentUploadDialog';
import DocumentError from '@/components/documentos/DocumentError';
import LowStorageWarning from '@/components/documentos/LowStorageWarning';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card'; // Import Card e CardContent
import { FileArchive } from 'lucide-react'; // Ícone para o cabeçalho

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
    error // Certifique-se de que `error` é o erro combinado de useDocumentos
  } = useDocumentos();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await listarDocumentos();
        await calcularEspacoDisponivel();
      } catch (err) {
        // Erro já tratado dentro de useDocumentos e refletido no `error` state
        console.error('Erro inicial ao carregar documentos na DocumentosPage:', err);
      }
    };
    
    fetchData();
  }, [listarDocumentos, calcularEspacoDisponivel]); // Removida dependência duplicada de listarDocumentos

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
      // Erro já tratado em useDocumentos
      console.error('Erro ao atualizar dados na DocumentosPage:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 lg:p-8 bg-lawyer-background min-h-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-left flex items-center">
            <FileArchive className="mr-3 h-7 w-7 text-lawyer-primary" />
            Gestão de Documentos
          </h1>
          <p className="text-gray-600 text-left mt-1">
            Organize e acesse os arquivos importantes do seu escritório.
          </p>
        </div>
        
        <DocumentHeader 
          onUploadClick={() => setIsUploadDialogOpen(true)} 
          isLoading={isLoading} 
          espacoDisponivel={espacoDisponivel}
        />
        
        <DocumentoWarning />
        
        <DocumentoStorageInfo />
        
        <Card className="shadow-lg rounded-lg">
          <CardContent className="p-4 md:p-6">
            <DocumentError error={error} />
            
            <DocumentSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              handleRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            
            <DocumentList 
              documents={filteredDocuments}
              isLoading={isLoading} // Passando o estado de loading principal
              isRefreshing={isRefreshing}
              searchTerm={searchTerm}
              filterType={filterType}
              onRefresh={handleRefresh}
              onUploadClick={() => setIsUploadDialogOpen(true)}
              error={error}
            />
            
            <LowStorageWarning espacoDisponivel={espacoDisponivel} />
          </CardContent>
        </Card>
      </div>
      
      <DocumentUploadDialog 
        isOpen={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen}
      />
    </AdminLayout>
  );
};

export default DocumentosPage;