
import React from 'react';
import { Search } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import DataJudPageContent from '@/components/datajud/DataJudPageContent';

const DataJudPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="p-4 md:p-6 lg:p-8">
          <SharedPageHeader
            title="Consulta DataJud CNJ"
            description="Acesse dados oficiais dos processos judiciais através da API pública do CNJ"
            pageIcon={<Search />}
            showActionButton={false}
          />
          <DataJudPageContent />
        </div>
      </div>
    </AdminLayout>
  );
};

export default DataJudPage;
