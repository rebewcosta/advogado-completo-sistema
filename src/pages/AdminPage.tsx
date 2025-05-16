
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CriarContaEspecial from '@/components/admin/CriarContaEspecial';

const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Lista de emails de administradores
  const adminEmails = ['webercostag@gmail.com']; // Adicione aqui os emails autorizados

  useEffect(() => {
    // Verificar se o usuário atual é um administrador
    if (user && user.email && adminEmails.includes(user.email)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Esta página é restrita apenas para administradores do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Painel Administrativo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gerenciamento de Contas Especiais</h2>
          <p className="text-gray-600 mb-6">
            Use esta seção para criar contas com acesso especial ao sistema, sem necessidade de pagamento.
          </p>
          
          <CriarContaEspecial />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
