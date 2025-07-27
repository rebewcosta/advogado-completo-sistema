import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

interface ClientesPageHeaderProps {
  onAddClient: () => void;
}

const ClientesPageHeader: React.FC<ClientesPageHeaderProps> = ({ onAddClient }) => {

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-blue-100 mt-1">Gerencie seus clientes</p>
        </div>
        <Button 
          onClick={onAddClient} 
          className="w-full sm:w-auto h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
};

export default ClientesPageHeader;