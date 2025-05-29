// src/components/processos/MeusProcessosTable.tsx
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
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, FileText as ProcessIcon } from 'lucide-react';
import { ProcessoComCliente } from '@/stores/useProcessesStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MeusProcessosTableProps {
  processes: ProcessoComCliente[];
  onEdit: (processo: ProcessoComCliente) => void;
  onView: (processo: ProcessoComCliente) => void;
  onToggleStatus: (processo: ProcessoComCliente) => void;
  onDelete: (processoId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

const MeusProcessosTable: React.FC<MeusProcessosTableProps> = ({
  processes,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined, withRelative = false) => {
    if (!dateString) return <span className="text-gray-400">-</span>;
    try {
        const dateToParse = dateString.includes('T') ? dateString : dateString + 'T00:00:00Z';
        const date = parseISO(dateToParse);
        const formatted = format(date, "dd/MM/yy", { locale: ptBR }); 

        if (withRelative) {
            if (isToday(date)) return <><span className="font-semibold text-orange-600">{formatted}</span> (Hoje)</>;
            if (isPast(date) && !isToday(date)) return <><span className="font-semibold text-red-600">{formatted}</span> (Atrasado)</>;
        }
        return formatted;
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
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando processos...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200/80 shadow-md bg-white">
      <Table className="min-w-full">
        <TableHeader className="bg-lawyer-dark">
          <TableRow className="hover:bg-lawyer-dark/90">
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Processo / Vara</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Cliente</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Tipo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">Próximo Prazo</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/70">
          {processes.length > 0 ? (
            processes.map((processo) => {
              const statusStyle = getStatusStyles(processo.status_processo);
              return (
                <TableRow key={processo.id} className="hover:bg-gray-50/60 transition-colors text-left">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer"
                      onClick={() => onView(processo)}
                      title={processo.numero_processo}
                    >
                      {processo.numero_processo}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{processo.vara_tribunal || '-'}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {processo.clientes?.nome || processo.nome_cliente_text || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                    {processo.tipo_processo}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2.5 font-medium rounded-full cursor-pointer", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(processo)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1.5 h-2 w-2 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                        "px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell",
                        processo.proximo_prazo && isPast(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && !isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "text-red-600 font-semibold",
                        processo.proximo_prazo && isToday(parseISO(processo.proximo_prazo + 'T00:00:00Z')) && processo.status_processo !== 'Concluído' && "text-orange-600 font-semibold"
                    )}>
                    {formatDateString(processo.proximo_prazo, true)}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuItem onClick={() => onView(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(processo)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar Processo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(processo.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir Processo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-16 text-center text-gray-500">
                <ProcessIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
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

export default MeusProcessosTable;