
import React from 'react';
import { FileText } from 'lucide-react';
import DocumentHeader from '@/components/documentos/DocumentHeader';
import DocumentList from '@/components/documentos/DocumentList';
import DocumentListAsCards from '@/components/documentos/DocumentListAsCards';
import DocumentSearchBar from '@/components/documentos/DocumentSearchBar';
import LowStorageWarning from '@/components/documentos/LowStorageWarning';
import DocumentStorageInfo from '@/components/DocumentStorageInfo';
import DocumentoWarning from '@/components/DocumentoWarning';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const DocumentosPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Documentos"
          description="Gerencie e organize todos os documentos do escritório."
          pageIcon={<FileText />}
        />

        <DocumentoWarning />
        <LowStorageWarning />
        <DocumentStorageInfo />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-6">
            <DocumentHeader />
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-4">
            <DocumentSearchBar />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <DocumentList />
        </div>
        <div className="md:hidden">
          <DocumentListAsCards />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default DocumentosPage;
