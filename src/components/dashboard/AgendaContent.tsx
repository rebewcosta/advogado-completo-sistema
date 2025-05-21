// src/components/dashboard/AgendaContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CalendarDays, CalendarClock, AlertOctagon, PlusCircle, ArrowRight } from 'lucide-react'; // Ícones ajustados
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const cardData = [
  { title: "Compromissos para Hoje", description: "Sua agenda para o dia atual.", icon: CalendarClock, emptyIcon: CalendarClock, link: "/agenda" },
  { title: "Próximas Audiências", description: "Audiências importantes agendadas.", icon: Briefcase, emptyIcon: Briefcase, link: "/agenda" }, // Usando Briefcase para audiências
  { title: "Prazos Importantes", description: "Prazos que exigem sua atenção em breve.", icon: AlertOctagon, emptyIcon: AlertOctagon, link: "/agenda" },
];

const AgendaContent: React.FC = () => {
  const hasData = false; // Simula se há dados para exibir

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">Resumo da Agenda</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Seus próximos eventos e tarefas importantes.
              </CardDescription>
            </div>
            <Button variant="default" size="sm" asChild className="bg-lawyer-primary hover:bg-lawyer-primary/90 self-start sm:self-center">
              <Link to="/agenda" className="flex items-center"> {/* Ajuste o link para a página de adicionar evento */}
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Novo Evento
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 md:py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <CalendarDays className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-md font-medium mb-1">Sua agenda está organizada.</p>
            <p className="text-sm">Visualize seus compromissos e prazos aqui.</p>
            <Button variant="link" size="sm" asChild className="mt-3 text-lawyer-primary">
              <Link to="/agenda">
                Acessar Agenda Completa <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cardData.map((item, index) => {
          const Icon = item.icon;
          const EmptyIcon = item.emptyIcon;
          return (
            <Card key={index} className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300 flex flex-col">
              <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-md font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                      <Icon className="h-4 w-4 mr-2 text-lawyer-primary" />
                      {item.title}
                    </CardTitle>
                  </div>
                {item.description && (
                  <CardDescription className="text-xs pt-1 text-gray-500 dark:text-gray-400">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center h-32 sm:h-40"> {/* Altura para conteúdo da lista */}
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <EmptyIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-xs">Nenhum item por enquanto.</p>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-3 border-t dark:border-gray-700">
                 <Button variant="link" size="sm" asChild className="text-lawyer-primary p-0 h-auto text-xs font-medium">
                    <Link to={item.link}>
                      Ver Detalhes <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaContent;