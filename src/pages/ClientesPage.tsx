
import React from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ClienteFormFields from '@/components/clientes/ClienteFormFields';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const ClientesPage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Clientes"
          description="Gerencie seus clientes e mantenha suas informações atualizadas."
          pageIcon={<Users />}
        />

        <Card className="mb-6 shadow-md rounded-lg border border-gray-200/80">
          <CardContent className="p-6">
            <ClienteFormFields />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <ClienteTable />
        </div>
        <div className="md:hidden">
          <ClienteListAsCards />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ClientesPage;
