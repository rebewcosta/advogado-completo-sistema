
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsultaProcessual from './ConsultaProcessual';
import BuscaAvancada from './BuscaAvancada';
import PainelFavoritos from './PainelFavoritos';
import AnaliseJurimetrica from './AnaliseJurimetrica';
import HistoricoConsultas from './HistoricoConsultas';
import AvisosLegais from './AvisosLegais';

const DataJudPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('consulta');

  return (
    <div className="space-y-6">
      <AvisosLegais />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="consulta">Consulta Direta</TabsTrigger>
          <TabsTrigger value="busca">Busca Avançada</TabsTrigger>
          <TabsTrigger value="favoritos">Meus Favoritos</TabsTrigger>
          <TabsTrigger value="jurimetria">Jurimetria</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="consulta" className="space-y-4">
          <ConsultaProcessual />
        </TabsContent>

        <TabsContent value="busca" className="space-y-4">
          <BuscaAvancada />
        </TabsContent>

        <TabsContent value="favoritos" className="space-y-4">
          <PainelFavoritos />
        </TabsContent>

        <TabsContent value="jurimetria" className="space-y-4">
          <AnaliseJurimetrica />
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <HistoricoConsultas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataJudPageContent;
