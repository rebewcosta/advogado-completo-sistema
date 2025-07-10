
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AdminPanelComplete = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este componente foi reorganizado. Todas as funcionalidades administrativas 
          agora estão disponíveis diretamente no Painel Administrativo principal.
        </AlertDescription>
      </Alert>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Painel Administrativo Completo</CardTitle>
          <CardDescription>
            Funcionalidade integrada ao painel principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Para acessar todas as funcionalidades administrativas, utilize as abas 
            do painel principal. Cada seção foi organizada de forma clara e intuitiva.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanelComplete;
