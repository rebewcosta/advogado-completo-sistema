
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import DocumentHeader from '@/components/documentos/DocumentHeader';
import DocumentList from '@/components/documentos/DocumentList';
import DocumentListAsCards from '@/components/documentos/DocumentListAsCards';
import DocumentSearchBar from '@/components/documentos/DocumentSearchBar';
import LowStorageWarning from '@/components/documentos/LowStorageWarning';
import DocumentoStorageInfo from '@/components/DocumentoStorageInfo';
import DocumentoWarning from '@/components/DocumentoWarning';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";
import { useDocumentos } from '@/hooks/useDocumentos';

const DocumentosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const {
    documents,
    isLoading,
    isRefreshing,
    espacoDisponivel,
    uploadDocumento,
    obterUrlDocumento,
    excluirDocumento,
    listarDocumentos,
    error
  } = useDocumentos();

  const handleUploadClick = () => {
    // Implementar lógica de upload
    console.log('Upload clicked');
  };

  const handleRefresh = () => {
    listarDocumentos();
  };

  const handleView = async (path: string) => {
    try {
      const url = await obterUrlDocumento(path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    try {
      await excluirDocumento(id, path);
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Documentos"
          description="Gerencie e organize todos os documentos do escritório."
          pageIcon={<FileText />}
        />

        <DocumentoWarning />
        <LowStorageWarning espacoDisponivel={espacoDisponivel} />
        <DocumentoStorageInfo />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-6">
            <DocumentHeader
              onUploadClick={handleUploadClick}
              isLoading={isLoading}
              espacoDisponivel={espacoDisponivel}
            />
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-4">
            <DocumentSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              handleRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <DocumentList
            documents={documents}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            searchTerm={searchTerm}
            filterType={filterType}
            onRefresh={handleRefresh}
            onUploadClick={handleUploadClick}
            error={error}
          />
        </div>
        <div className="md:hidden">
          <DocumentListAsCards
            documents={documents}
            isLoading={isLoading}
            searchTerm={searchTerm}
            filterType={filterType}
            onRefresh={handleRefresh}
            onUploadClick={handleUploadClick}
            error={error}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default DocumentosPage;
