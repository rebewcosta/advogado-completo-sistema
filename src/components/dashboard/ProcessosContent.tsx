// src/components/dashboard/ProcessosContent.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Briefcase, BarChart3, Users, ListChecks, PlusCircle, ArrowRight } from 'lucide-react'; // Ícones ajustados
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Dados de exemplo (mock) - para visualização
const cardData = [
  { title: "Processos por Status", description: "Distribuição dos seus processos ativos, concluídos e suspensos.", icon: BarChart3, link: "/relatorios", emptyIcon: BarChart3 },
  { title: "Processos por Cliente", description: "Visualize quais clientes possuem mais processos em andamento.", icon: Users, link: "/clientes", emptyIcon: Users },
  { title: "Prazos da Semana", description: "Acompanhe os prazos importantes que vencem esta semana.", icon: ListChecks, link: "/agenda", emptyIcon: ListChecks },
];

const ProcessosContent: React.FC = () => {
  const hasData = false; // Simula se há dados para exibir

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-md hover:shadow-lg dark:bg-gray-800 transition-shadow duration-300">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">Visão Geral de Processos</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Resumo e atalhos para gerenciamento de processos.
              </CardDescription>
            </div>
            <Button variant="default" size="sm" asChild className="bg-lawyer-primary hover:bg-lawyer-primary/90 self-start sm:self-center">
              <Link to="/meus-processos" className="flex items-center">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Novo Processo
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 md:py-16 text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-md font-medium mb-1">Acompanhe seus processos aqui.</p>
            <p className="text-sm">Métricas e listas detalhadas estarão disponíveis em breve.</p>
            <Button variant="link" size="sm" asChild className="mt-3 text-lawyer-primary">
              <Link to="/meus-processos">
                Ver Todos os Processos <ArrowRight className="ml-1 h-4 w-4" />
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
              <CardContent className="flex-grow flex items-center justify-center h-40 sm:h-48"> {/* Altura mínima para conteúdo futuro */}
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <EmptyIcon className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs">Dados ou gráfico aqui.</p>
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

export default ProcessosContent;