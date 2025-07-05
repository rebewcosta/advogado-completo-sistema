
import React from 'react';
import { BookOpen, Clock, Wrench } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md mx-auto text-center">
              <CardHeader className="pb-6">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="w-8 h-8 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Em Breve</CardTitle>
                <CardDescription className="text-lg">
                  Funcionalidade em desenvolvimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  Estamos trabalhando na integração com APIs oficiais para trazer o monitoramento 
                  automático de publicações nos diários oficiais de todo o Brasil.
                </p>
                
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Enquanto isso:</strong> Você pode utilizar a nova página 
                    <strong> DataJud CNJ</strong> para consultar processos através da API oficial do CNJ.
                  </AlertDescription>
                </Alert>

                <div className="pt-4 text-sm text-gray-500">
                  <p>Em breve você poderá:</p>
                  <ul className="mt-2 space-y-1 text-left">
                    <li>• Monitorar publicações automaticamente</li>
                    <li>• Receber alertas em tempo real</li>
                    <li>• Filtrar por advogado, estado e comarca</li>
                    <li>• Exportar relatórios de publicações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PublicacoesPage;
