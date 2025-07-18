
// src/components/processos/ProcessTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, Search } from 'lucide-react';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProcessTableProps {
  processes: ProcessoComCliente[];
  onEdit: (processo: ProcessoComCliente) => void;
  onView: (processo: ProcessoComCliente) => void;
  onToggleStatus: (processo: ProcessoComCliente) => void;
  onDelete: (processoId: string) => void;
  onViewDetails: (processo: ProcessoComCliente) => void;
  isLoading: boolean;
  searchTerm: string;
}

const ProcessTable: React.FC<ProcessTableProps> = ({
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
    if (!dateString) return <span className="text-gray-400">-</span>;
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd MMM, yyyy", { locale: ptBR }); // Formato: 27 Mai, 2025

        if (withRelative) {
            if (isToday(date)) return <><span className="font-semibold text-orange-600">{formatted}</span> (Hoje)</>;
            if (isPast(date) && !isToday(date)) return <><span className="font-semibold text-red-600">{formatted}</span> (Atrasado)</>;
        }
        return formatted;
    } catch (e) {
        console.error("Erro ao formatar data em ProcessTable:", dateString, e);
        return dateString; 
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

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="border-b-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-200">
            <TableHead className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[30%] whitespace-nowrap">Processo / Vara</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-[25%] whitespace-nowrap">Cliente</TableHead>
            <TableHead className="hidden md:table-cell px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Tipo</TableHead>
            <TableHead className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Status</TableHead>
            <TableHead className="hidden sm:table-cell px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">Próximo Prazo</TableHead>
            <TableHead className="px-4 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-[120px] whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
          {processes.length > 0 ? (
            processes.map((processo) => {
              const statusStyle = getStatusStyles(processo.status_processo);
              return (
                <TableRow key={processo.id} className="hover:bg-white/80 hover:shadow-sm transition-all duration-200 backdrop-blur-sm">
                  <TableCell className="px-4 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-medium text-gray-800">{processo.numero_processo}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{processo.vara_tribunal || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 align-top">
                    {processo.clientes?.nome || processo.nome_cliente_text || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                    {processo.tipo_processo}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap align-top">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-2.5 font-medium rounded-full cursor-pointer backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(processo)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1.5 h-2 w-2 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                        "hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-600 align-top",
                        processo.proximo_prazo && isPast(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && !isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "text-red-600 font-semibold",
                        processo.proximo_prazo && isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "text-orange-600 font-semibold"
                    )}>
                    {formatDateString(processo.proximo_prazo, true)}
                  </TableCell>
                  <TableCell className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                    <div className="flex items-center justify-end gap-1">
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
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                          <DropdownMenuItem onClick={() => onView(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-all duration-200">
                            <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-all duration-200">
                            <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar Processo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-200/60"/>
                          <DropdownMenuItem
                            onClick={() => onDelete(processo.id)}
                            className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir Processo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-16 text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium mb-1">Nenhum processo encontrado.</p>
                <p className="text-sm">
                  {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Novo Processo\" para adicionar."}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
