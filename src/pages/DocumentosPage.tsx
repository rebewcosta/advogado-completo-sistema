
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

  // Verificar e atualizar o espaço disponível quando o componente for montado
  useEffect(() => {
    const fetchData = async () => {
      try {
        await listarDocumentos();
        await calcularEspacoDisponivel();
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar documentos com base na pesquisa e tipo
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
        description: "Os documentos foram atualizados com sucesso",
      });
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <DocumentHeader 
          onUploadClick={() => setIsUploadDialogOpen(true)} 
          isLoading={isLoading} 
          espacoDisponivel={espacoDisponivel}
        />
        
        <DocumentoWarning />
        
        {/* Informações de armazenamento */}
        <DocumentoStorageInfo />
        
        <div className="bg-white rounded-lg shadow-sm p-6">
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
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            searchTerm={searchTerm}
            filterType={filterType}
            onRefresh={handleRefresh}
            onUploadClick={() => setIsUploadDialogOpen(true)}
            error={error}
          />
          
          <LowStorageWarning espacoDisponivel={espacoDisponivel} />
        </div>
      </div>
      
      {/* Modal de Upload */}
      <DocumentUploadDialog 
        isOpen={isUploadDialogOpen} 
        onOpenChange={setIsUploadDialogOpen}
      />
    </AdminLayout>
  );
};

export default DocumentosPage;
