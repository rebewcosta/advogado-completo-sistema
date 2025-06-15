
import React from 'react';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Wrench } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrazosCalculadora } from '@/components/prazos/PrazosCalculadora';
import { ConsultaCep } from '@/components/correios/ConsultaCep';
import { CalculadoraCorrecao } from '@/components/ferramentas/CalculadoraCorrecao';
import { ConsultaFeriados } from '@/components/ferramentas/ConsultaFeriados';
import { ValidadorCpfCnpj } from '@/components/ferramentas/ValidadorCpfCnpj';
import { GeradorPeticoes } from '@/components/ferramentas/GeradorPeticoes';
import { GeradorQrCode } from '@/components/ferramentas/GeradorQrCode';

const FerramentasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <SharedPageHeader 
          title="Ferramentas" 
          description="Acesse todas as ferramentas disponíveis para otimizar seu trabalho jurídico"
          pageIcon={<Wrench />}
        />
        
        <Tabs defaultValue="prazos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-1">
            <TabsTrigger value="prazos" className="text-xs md:text-sm">Prazos</TabsTrigger>
            <TabsTrigger value="cep" className="text-xs md:text-sm">CEP</TabsTrigger>
            <TabsTrigger value="correcao" className="text-xs md:text-sm">Correção</TabsTrigger>
            <TabsTrigger value="feriados" className="text-xs md:text-sm">Feriados</TabsTrigger>
            <TabsTrigger value="validador" className="text-xs md:text-sm">CPF/CNPJ</TabsTrigger>
            <TabsTrigger value="peticoes" className="text-xs md:text-sm">Petições</TabsTrigger>
            <TabsTrigger value="qrcode" className="text-xs md:text-sm">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prazos" className="mt-6">
            <PrazosCalculadora />
          </TabsContent>
          
          <TabsContent value="cep" className="mt-6">
            <ConsultaCep />
          </TabsContent>
          
          <TabsContent value="correcao" className="mt-6">
            <CalculadoraCorrecao />
          </TabsContent>
          
          <TabsContent value="feriados" className="mt-6">
            <ConsultaFeriados />
          </TabsContent>
          
          <TabsContent value="validador" className="mt-6">
            <ValidadorCpfCnpj />
          </TabsContent>
          
          <TabsContent value="peticoes" className="mt-6">
            <GeradorPeticoes />
          </TabsContent>
          
          <TabsContent value="qrcode" className="mt-6">
            <GeradorQrCode />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FerramentasPage;
