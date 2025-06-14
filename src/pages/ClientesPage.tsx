
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ClienteFormFields from '@/components/clientes/ClienteFormFields';
import ClienteTable from '@/components/clientes/ClienteTable';
import ClienteListAsCards from '@/components/clientes/ClienteListAsCards';
import { Card, CardContent } from '@/components/ui/card';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";
import type { Database } from '@/integrations/supabase/types';

type Cliente = Database['public']['Tables']['clientes']['Row'];

const ClientesPage = () => {
  const { user } = useAuth();
  const [clients] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    tipo_cliente: 'Pessoa Física' as const,
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
    status_cliente: 'Ativo' as const
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (cliente: Cliente) => {
    console.log('Edit client:', cliente);
  };

  const handleView = (cliente: Cliente) => {
    console.log('View client:', cliente);
  };

  const handleToggleStatus = (cliente: Cliente) => {
    console.log('Toggle status for client:', cliente);
  };

  const handleDelete = (clienteId: string) => {
    console.log('Delete client:', clienteId);
  };

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
            <ClienteFormFields 
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
            />
          </CardContent>
        </Card>

        {/* Renderização condicional: Tabela para Desktop, Cards para Mobile */}
        <div className="hidden md:block">
          <ClienteTable 
            clients={clients}
            onEdit={handleEdit}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            isLoading={false}
            searchTerm={searchTerm}
          />
        </div>
        <div className="md:hidden">
          <ClienteListAsCards 
            clients={clients}
            onEdit={handleEdit}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            isLoading={false}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ClientesPage;
