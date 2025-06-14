
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { User, CreditCard, Shield } from 'lucide-react';
import GerenciarAssinatura from '@/components/assinatura/GerenciarAssinatura';
import PerfilInfoTab from '@/components/perfil/PerfilInfoTab';
import SegurancaTab from '@/components/perfil/SegurancaTab';

const PerfilUsuarioPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const { user, refreshSession } = useAuth();

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setNome(user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário');
    }
  }, [user]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
          <p className="text-gray-500">Gerencie suas informações, assinatura e segurança.</p>
        </div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Assinatura
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <PerfilInfoTab 
              user={user}
              nome={nome}
              setNome={setNome}
              email={email}
              refreshSession={refreshSession}
            />
          </TabsContent>

          <TabsContent value="assinatura">
            <GerenciarAssinatura />
          </TabsContent>

          <TabsContent value="seguranca">
            <SegurancaTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PerfilUsuarioPage;
