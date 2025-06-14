
import React from 'react';
import { BookOpen } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import PublicacoesPageContent from '@/components/publicacoes/PublicacoesPageContent';

const PublicacoesPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="p-4 md:p-6 lg:p-8">
          <SharedPageHeader
            title="Monitoramento de Publicações"
            description="Acompanhe suas publicações nos diários oficiais do Brasil"
            pageIcon={<BookOpen />}
            showActionButton={false}
          />
          <PublicacoesPageContent />
        </div>
      </div>
    </AdminLayout>
  );
};

export default PublicacoesPage;
