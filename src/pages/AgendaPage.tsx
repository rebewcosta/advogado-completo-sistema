
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import SharedPageHeader from '@/components/shared/SharedPageHeader';
import AgendaFilters from '@/components/agenda/AgendaFilters';
import AgendaEventTabs from '@/components/agenda/AgendaEventTabs';
import { AgendaEventForm } from '@/components/AgendaEventForm';
import { useAgendaEvents } from '@/hooks/useAgendaEvents';
import type { AgendaEvent } from '@/types/agenda';

const AgendaPage = () => {
  const {
    events,
    isLoading,
    isRefreshing,
    handleSaveEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleRefresh
  } = useAgendaEvents();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("lista");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleSaveEventWrapper = async (eventData: any) => {
    if (selectedEvent) {
      const success = await handleUpdateEvent(selectedEvent.id, eventData);
      if (success) {
        setIsFormOpen(false);
        setSelectedEvent(null);
      }
      return success;
    } else {
      const success = await handleSaveEvent(eventData);
      if (success) {
        setIsFormOpen(false);
        setSelectedEvent(null);
      }
      return success;
    }
  };

  const handleEditEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleViewEvent = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.descricao_evento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Convert selectedEvent to the correct format for the form
  const convertEventForForm = (event: AgendaEvent | null) => {
    if (!event) return null;
    
    // Ensure prioridade is one of the expected values
    const validPrioridade = (prio: string): 'baixa' | 'média' | 'alta' => {
      if (prio === 'baixa' || prio === 'média' || prio === 'alta') {
        return prio;
      }
      return 'média'; // default fallback
    };
    
    return {
      titulo: event.titulo,
      descricao_evento: event.descricao_evento,
      data_hora_inicio: new Date(event.data_hora_inicio),
      duracao_minutos: event.duracao_minutos,
      local_evento: event.local_evento,
      cliente_associado_id: event.cliente_associado_id,
      processo_associado_id: event.processo_associado_id,
      prioridade: validPrioridade(event.prioridade),
      tipo_evento: event.tipo_evento,
      status_evento: event.status_evento,
      id: event.id
    };
  };

  if (isLoading && events.length === 0) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <span className="text-gray-500 mt-3">Carregando agenda...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="p-4 md:p-6 lg:p-8">
          <SharedPageHeader
            title="Agenda de Compromissos"
            description="Organize seus prazos, audiências e reuniões."
            pageIcon={<Calendar />}
            actionButtonText="Novo Evento"
            onActionButtonClick={() => {
              setSelectedEvent(null);
              setIsFormOpen(true);
            }}
            isLoading={isLoading || isRefreshing}
          />

          <AgendaFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          <AgendaEventTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            filteredEvents={filteredEvents}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEditEvent={handleEditEvent}
            onViewEvent={handleViewEvent}
            onDeleteEvent={handleDeleteEvent}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
          />

          <AgendaEventForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSave={handleSaveEventWrapper}
            initialEventData={convertEventForForm(selectedEvent)}
            clientes={[]}
            processos={[]}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AgendaPage;
