
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrazosDashboard } from './PrazosDashboard';
import { PrazosCalculadora } from './PrazosCalculadora';
import { Clock, Calculator } from 'lucide-react';

export const PrazosPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calculadora" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <PrazosDashboard />
        </TabsContent>

        <TabsContent value="calculadora" className="space-y-6">
          <PrazosCalculadora />
        </TabsContent>
      </Tabs>
    </div>
  );
};
