
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProcessosContent: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Processos por Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="text-center py-8 text-muted-foreground">
              Nenhum processo cadastrado
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audiências por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma audiência agendada
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processos por Área</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="text-center py-8 text-muted-foreground">
              Nenhum processo cadastrado
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum processo cadastrado
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessosContent;
