
import React from 'react';
import { HelpCircle, MessageCircle, Book, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const SuportePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Suporte"
          description="Central de ajuda e suporte ao usuário."
          pageIcon={<HelpCircle />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2" />
                Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Acesse tutoriais, guias e documentação completa do sistema.
              </p>
              <Button variant="outline" className="w-full">
                Acessar Base de Conhecimento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2" />
                Chat de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Converse diretamente com nossa equipe de suporte.
              </p>
              <Button variant="outline" className="w-full">
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2" />
                Contato por Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Envie sua dúvida ou solicitação por email.
              </p>
              <Button variant="outline" className="w-full">
                Enviar Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default SuportePage;
