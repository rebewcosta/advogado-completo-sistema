
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AgendaEvent } from '@/pages/AgendaPage';
import { CalendarDays, Clock, MapPin, User, FileText, AlarmClock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type AgendaEventDetailProps = {
  event: AgendaEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export const AgendaEventDetail = ({ event, onClose, onDelete }: AgendaEventDetailProps) => {
  const formattedDate = format(event.dateTime, 'PPP', { locale: ptBR });
  const formattedTime = format(event.dateTime, 'HH:mm');
  const endTime = new Date(event.dateTime.getTime() + event.duration * 60000);
  const formattedEndTime = format(endTime, 'HH:mm');
  
  // Função para determinar a classe de cor baseada na prioridade
  const priorityColorClass = () => {
    switch (event.priority) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'média':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-2 ${priorityColorClass()}`}>
              Prioridade {event.priority}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-start gap-3">
            <CalendarDays className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Data</p>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Horário</p>
              <p className="text-muted-foreground">{formattedTime} - {formattedEndTime}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlarmClock className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Duração</p>
              <p className="text-muted-foreground">{event.duration} minutos</p>
            </div>
          </div>
          
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Local</p>
                <p className="text-muted-foreground">{event.location}</p>
              </div>
            </div>
          )}
          
          {event.clientName && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-muted-foreground">{event.clientName}</p>
              </div>
            </div>
          )}
          
          {event.processNumber && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-lawyer-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Processo</p>
                <p className="text-muted-foreground">{event.processNumber}</p>
              </div>
            </div>
          )}
          
          {event.description && (
            <>
              <Separator />
              <div>
                <p className="font-medium mb-2">Descrição</p>
                <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="destructive" 
            onClick={() => onDelete(event.id)}
            className="mr-auto"
          >
            Excluir
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            Fechar
          </Button>
          <Button 
            className="bg-lawyer-primary hover:bg-lawyer-primary/90"
          >
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
