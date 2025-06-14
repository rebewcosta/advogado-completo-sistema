
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgendaCalendarView from '@/components/agenda/AgendaCalendarView';
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
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="lista">Lista</TabsTrigger>
        <TabsTrigger value="calendario">Calendário</TabsTrigger>
      </TabsList>

      <TabsContent value="lista">
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

      <TabsContent value="calendario">
        <AgendaCalendarView
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
