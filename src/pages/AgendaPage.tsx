import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sidebar } from '@/components/ui/sidebar';

const AgendaPage = () => {
  const [activeTab, setActiveTab] = useState('compromissos');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventType, setEventType] = useState('appointment');
  
  // Mock data for the calendar
  const compromissos = [
    {
      id: 1,
      title: 'Audiência - Processo 12345',
      type: 'Audiência',
      date: '2025-05-18',
      time: '09:30',
      location: 'Tribunal de Justiça - Sala 302',
      client: 'João Silva',
    },
    {
      id: 2,
      title: 'Reunião com cliente',
      type: 'Reunião',
      date: '2025-05-20',
      time: '14:00',
      location: 'Escritório',
      client: 'Maria Oliveira',
    },
    {
      id: 3,
      title: 'Prazo - Recurso',
      type: 'Prazo',
      date: '2025-05-22',
      time: '18:00',
      location: 'Escritório',
      client: 'Pedro Santos',
    },
  ];

  const prazos = [
    {
      id: 1,
      process: 'Processo 12345',
      description: 'Apresentação de contestação',
      deadline: '2025-05-25',
      status: 'pendente',
      priority: 'alta',
      client: 'João Silva',
    },
    {
      id: 2,
      process: 'Processo 67890',
      description: 'Entrega de documentos complementares',
      deadline: '2025-05-30',
      status: 'pendente',
      priority: 'média',
      client: 'Maria Oliveira',
    },
    {
      id: 3,
      process: 'Processo 54321',
      description: 'Elaboração de recurso',
      deadline: '2025-06-10',
      status: 'pendente',
      priority: 'alta',
      client: 'Pedro Santos',
    },
  ];

  // Event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    client: '',
    process: '',
    priority: 'média',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would save the event to your database
    console.log('New event:', newEvent);
    setShowNewEventModal(false);
    // Reset form
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      client: '',
      process: '',
      priority: 'média',
    });
  };

  const renderTabContent = () => {
    if (activeTab === 'compromissos') {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Compromissos Agendados</h2>
            <Button onClick={() => {
              setEventType('appointment');
              setShowNewEventModal(true);
            }}>
              Novo Compromisso
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compromissos.map((compromisso) => (
                  <TableRow key={compromisso.id}>
                    <TableCell className="font-medium">{compromisso.title}</TableCell>
                    <TableCell>{compromisso.type}</TableCell>
                    <TableCell>{compromisso.date}</TableCell>
                    <TableCell>{compromisso.time}</TableCell>
                    <TableCell>{compromisso.location}</TableCell>
                    <TableCell>{compromisso.client}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    } else if (activeTab === 'prazos') {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Prazos Processuais</h2>
            <Button onClick={() => {
              setEventType('deadline');
              setShowNewEventModal(true);
            }}>
              Novo Prazo
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data Limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prazos.map((prazo) => (
                  <TableRow key={prazo.id}>
                    <TableCell className="font-medium">{prazo.process}</TableCell>
                    <TableCell>{prazo.description}</TableCell>
                    <TableCell>{prazo.deadline}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        prazo.status === 'concluído' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prazo.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        prazo.priority === 'alta' 
                          ? 'bg-red-100 text-red-800' 
                          : prazo.priority === 'média'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {prazo.priority}
                      </span>
                    </TableCell>
                    <TableCell>{prazo.client}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Agenda e Prazos</h1>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('compromissos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'compromissos'
                    ? 'border-lawyer-primary text-lawyer-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Compromissos
              </button>
              <button
                onClick={() => setActiveTab('prazos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'prazos'
                    ? 'border-lawyer-primary text-lawyer-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Prazos Processuais
              </button>
            </nav>
          </div>
        </div>

        {renderTabContent()}

        {/* Modal for adding new events */}
        {showNewEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {eventType === 'appointment' ? 'Novo Compromisso' : 'Novo Prazo'}
                </h2>
                <button onClick={() => setShowNewEventModal(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </span>
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={newEvent.date}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="time">Hora</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </span>
                        <Input
                          id="time"
                          name="time"
                          type="time"
                          value={newEvent.time}
                          onChange={handleInputChange}
                          className="pl-10"
                          required={eventType === 'appointment'}
                        />
                      </div>
                    </div>
                  </div>

                  {eventType === 'appointment' && (
                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        name="location"
                        value={newEvent.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="client">Cliente</Label>
                    <Input
                      id="client"
                      name="client"
                      value={newEvent.client}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {eventType === 'deadline' && (
                    <>
                      <div>
                        <Label htmlFor="process">Processo</Label>
                        <Input
                          id="process"
                          name="process"
                          value={newEvent.process}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <select
                          id="priority"
                          name="priority"
                          value={newEvent.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary"
                          required
                        >
                          <option value="baixa">Baixa</option>
                          <option value="média">Média</option>
                          <option value="alta">Alta</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lawyer-primary focus:border-lawyer-primary"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewEventModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Salvar
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPage;
