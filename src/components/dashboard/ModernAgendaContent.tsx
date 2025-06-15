
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users } from 'lucide-react';

const ModernAgendaContent: React.FC = () => {
  const proximosEventos = [
    { id: 1, titulo: 'Audiência - Caso Silva', data: '2025-06-16', hora: '14:00', tipo: 'audiencia' },
    { id: 2, titulo: 'Reunião com Cliente', data: '2025-06-17', hora: '10:00', tipo: 'reuniao' },
    { id: 3, titulo: 'Prazo Recurso - Processo 123', data: '2025-06-18', hora: '17:00', tipo: 'prazo' }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center">
          <Calendar className="mr-3 h-6 w-6" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {proximosEventos.map((evento) => (
            <div key={evento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  evento.tipo === 'audiencia' ? 'bg-red-100 text-red-600' :
                  evento.tipo === 'reuniao' ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {evento.tipo === 'audiencia' ? <Users className="h-4 w-4" /> :
                   evento.tipo === 'reuniao' ? <Users className="h-4 w-4" /> :
                   <Clock className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{evento.titulo}</h4>
                  <p className="text-sm text-gray-600">{evento.data} às {evento.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernAgendaContent;
