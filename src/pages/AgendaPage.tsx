
import React from 'react';
import AdminLayout from '@/components/AdminLayout';

const AgendaPage = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Agenda</h1>
        <p className="text-gray-600">
          Esta página exibirá o calendário de compromissos e prazos do escritório.
        </p>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700">
            Conteúdo da agenda em desenvolvimento. Em breve você poderá gerenciar seus compromissos aqui.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;
