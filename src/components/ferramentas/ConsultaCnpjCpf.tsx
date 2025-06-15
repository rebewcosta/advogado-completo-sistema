
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsultaCnpj } from './ConsultaCnpj';
import { ConsultaCpf } from './ConsultaCpf';

export const ConsultaCnpjCpf: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Consulta CNPJ/CPF
        </CardTitle>
        <CardDescription>
          Consulte dados de empresas (CNPJ) e informações de CPF via APIs oficiais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cnpj" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cnpj">CNPJ</TabsTrigger>
            <TabsTrigger value="cpf">CPF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cnpj" className="mt-6">
            <ConsultaCnpj />
          </TabsContent>
          
          <TabsContent value="cpf" className="mt-6">
            <ConsultaCpf />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
