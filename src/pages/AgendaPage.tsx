
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import AgendaCalendarView from '@/components/agenda/AgendaCalendarView';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import { Toaster } from "@/components/ui/toaster";
import type { Database } from '@/integrations/supabase/types';

export type EventoAgenda = Database['public']['Tables']['agenda_eventos']['Row'] & {
  clientes?: { id: string; nome: string } | null;
  processos?: { id: string; numero_processo: string } | null;
};

const AgendaPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events] = useState<EventoAgenda[]>([]); // Mock empty events for now

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: EventoAgenda) => {
    console.log('Event clicked:', event);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SharedPageHeader
          title="Agenda"
          description="Gerencie compromissos, audiências e prazos importantes."
          pageIcon={<Calendar />}
        />
        
        <AgendaCalendarView 
          events={events}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default AgendaPage;
