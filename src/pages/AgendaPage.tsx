
import React from 'react';
import { Calendar } from 'lucide-react';
import AgendaCalendarView from '@/components/agenda/AgendaCalendarView';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";

const AgendaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Agenda"
          description="Gerencie compromissos, audiências e prazos importantes."
          pageIcon={<Calendar />}
        />
        
        <AgendaCalendarView />
      </div>
      <Toaster />
    </div>
  );
};

export default AgendaPage;
