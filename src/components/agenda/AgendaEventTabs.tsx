
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModernCalendarView from '@/components/agenda/ModernCalendarView';
import AgendaEventTable from '@/components/agenda/AgendaEventTable';
import AgendaEventListAsCards from '@/components/agenda/AgendaEventListAsCards';
import type { AgendaEvent } from '@/types/agenda';

interface AgendaEventTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  filteredEvents: AgendaEvent[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onEditEvent: (event: AgendaEvent) => void;
  onViewEvent: (event: AgendaEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isLoading: boolean;
  isRefreshing: boolean;
}

const AgendaEventTabs: React.FC<AgendaEventTabsProps> = ({
  activeTab,
  onTabChange,
  filteredEvents,
  selectedDate,
  onDateSelect,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  isLoading,
  isRefreshing
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6 lg:space-y-8">
      <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-12 sm:h-14">
        <TabsTrigger 
          value="lista" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 text-sm sm:text-base font-medium"
        >
          Lista
        </TabsTrigger>
        <TabsTrigger 
          value="calendario"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300 text-sm sm:text-base font-medium"
        >
          Calendário
        </TabsTrigger>
      </TabsList>

      <TabsContent value="lista" className="animate-fade-in mt-4 sm:mt-6">
        <div className="hidden md:block">
          <AgendaEventTable
            events={filteredEvents}
            onEdit={onEditEvent}
            onView={onViewEvent}
            onDelete={onDeleteEvent}
            isLoading={isLoading || isRefreshing}
          />
        </div>
        <div className="md:hidden">
          <AgendaEventListAsCards
            events={filteredEvents}
            onEdit={onEditEvent}
            onView={onViewEvent}
            onDelete={onDeleteEvent}
            isLoading={isLoading || isRefreshing}
          />
        </div>
      </TabsContent>

      <TabsContent value="calendario" className="animate-fade-in mt-4 sm:mt-6">
        <ModernCalendarView
          events={filteredEvents}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onEventClick={onEditEvent}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AgendaEventTabs;
