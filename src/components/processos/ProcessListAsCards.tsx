
// src/components/processos/ProcessListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, FileText as ProcessIcon, Search } from 'lucide-react';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';

interface ProcessListAsCardsProps {
  processes: ProcessoComCliente[];
  onEdit: (processo: ProcessoComCliente) => void;
  onView: (processo: ProcessoComCliente) => void;
  onToggleStatus: (processo: ProcessoComCliente) => void;
  onDelete: (processoId: string) => void;
  onViewDetails: (processo: ProcessoComCliente) => void;
  isLoading: boolean;
  searchTerm: string;
}

const ProcessListAsCards: React.FC<ProcessListAsCardsProps> = ({
  processes,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  onViewDetails,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined, withRelative = false) => {
    if (!dateString) return <span className="text-xs text-gray-500">-</span>;
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd/MM/yy", { locale: ptBR });

        if (withRelative) {
            if (isToday(date)) return <><span className="font-medium text-orange-500">{formatted}</span> <span className="text-xs">(Hoje)</span></>;
            if (isPast(date) && !isToday(date)) return <><span className="font-medium text-red-500">{formatted}</span> <span className="text-xs">(Atrasado)</span></>;
        }
        return <span className="text-gray-700">{formatted}</span>;
    } catch (e) {
        return <span className="text-xs text-red-500">Data Inválida</span>; 
    }
  };

  const getStatusStyles = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
    switch (status) {
      case 'Concluído': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Concluído' };
      case 'Em andamento': return { textColor: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500', label: 'Em Andamento' };
      case 'Suspenso': return { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500', label: 'Suspenso' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  if (isLoading && processes.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-gray-500 mt-3">Carregando processos...</p>
      </div>
    );
  }

  // Definição das colunas para cabeçalho e itens do card.
  const columnConfig = [
    { id: 'processo', label: "Processo / Vara", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'cliente', label: "Cliente", headerClass: "w-3/12 min-w-0 px-4 text-left", itemClass: "w-full md:w-3/12 min-w-0 px-4 text-left" },
    { id: 'tipo', label: "Tipo", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden md:block" },
    { id: 'status', label: "Status", headerClass: "w-[160px] flex-shrink-0 px-4 text-left flex items-center", itemClass: "w-full md:w-[160px] flex-shrink-0 px-4 text-left" },
    { id: 'prazo', label: "Próximo Prazo", headerClass: "w-[150px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[150px] flex-shrink-0 px-4 text-left hidden sm:block" },
    { id: 'acoes', label: "Ações", headerClass: "w-[120px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[120px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];

  return (
    <div className="mt-2">
      {/* Cabeçalhos de Coluna */}
      {processes.length > 0 && (
        <div className={cn(
            "hidden md:flex bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-t-2xl mb-1 shadow-lg sticky top-0 z-10 items-center backdrop-blur-sm"
        )}>
          {columnConfig.map(col => (
            <div key={col.id} className={cn(col.headerClass, "text-xs font-bold uppercase tracking-wider")}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {processes.length > 0 ? (
        <div className="space-y-3">
          {processes.map((processo) => {
            const statusStyle = getStatusStyles(processo.status_processo);
            return (
              <Card key={processo.id} className="bg-white/70 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-white/20 overflow-hidden hover:scale-[1.02] animate-fade-in">
                {/* Layout do Card: Empilhado no mobile, Flex no desktop */}
                <div className={cn("p-4 md:py-3 md:flex md:flex-row md:items-start")}> 
                  
                  {/* Processo / Vara */}
                  <div className={cn(columnConfig[0].itemClass, "mb-3 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer break-words transition-colors duration-200" onClick={() => onView(processo)}>
                        {processo.numero_processo}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 break-words">{processo.vara_tribunal || '-'}</div>
                  </div>

                  {/* Cliente */}
                  <div className={cn(columnConfig[1].itemClass, "mb-3 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[1].label}</div>
                    <div className="text-sm text-gray-700 break-words">{processo.clientes?.nome || processo.nome_cliente_text || <span className="text-gray-400">-</span>}</div>
                  </div>

                  {/* Tipo */}
                  <div className={cn(columnConfig[2].itemClass, "mb-3 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[2].label}</div>
                    <div className="text-sm text-gray-600 break-words">{processo.tipo_processo}</div>
                  </div>
                  
                  {/* Status */}
                  <div className={cn(columnConfig[3].itemClass, "mb-3 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[3].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-2.5 font-medium rounded-full cursor-pointer w-max backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(processo)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1.5 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </div>

                  {/* Próximo Prazo */}
                  <div className={cn(columnConfig[4].itemClass, "text-sm md:py-2 mb-3 md:mb-0", 
                      processo.proximo_prazo && isPast(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && !isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "font-bold",
                      processo.proximo_prazo && isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "font-bold"
                    )}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[4].label}</div>
                    {formatDateString(processo.proximo_prazo, true)}
                  </div>

                  {/* Ações */}
                  <div className={cn(columnConfig[5].itemClass, "mt-2 md:mt-0 md:py-1")}> 
                    <div className="flex items-center justify-start md:justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={() => onViewDetails(processo)}
                        title="Ver detalhes atualizados (DataJud)"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-lg backdrop-blur-sm transition-all duration-200">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                          <DropdownMenuItem onClick={() => onView(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-all duration-200">
                            <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-all duration-200">
                            <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200/60"/>
                          <DropdownMenuItem
                            onClick={() => onDelete(processo.id)}
                            className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-16 text-center text-gray-500 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
          <ProcessIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium mb-1">Nenhum processo encontrado.</p>
          <p className="text-sm">
            {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Novo Processo\" para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessListAsCards;
