// src/components/financeiro/TransacaoTable.tsx
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
import { Edit, MoreVertical, Trash2, TrendingUp, TrendingDown, Circle, BadgePercent } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Transacao = Database['public']['Tables']['transacoes_financeiras']['Row'];

interface TransacaoTableProps {
  transacoes: Transacao[];
  onEdit: (transacao: Transacao) => void;
  onDelete: (transacaoId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

const TransacaoTable: React.FC<TransacaoTableProps> = ({
  transacoes,
  onEdit,
  onDelete,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-gray-400">-</span>;
    try {
        return format(parseISO(dateString), "dd/MM/yy", { locale: ptBR });
    } catch (e) {
        return <span className="text-xs text-red-500">Inválida</span>; 
    }
  };

  const getStatusBadgeStyles = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
    switch (status) {
      case 'Pago': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Pago' };
      case 'Recebido': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Recebido' };
      case 'Pendente': return { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', dotColor: 'bg-yellow-500', label: 'Pendente' };
      case 'Atrasado': return { textColor: 'text-orange-700', bgColor: 'bg-orange-100', dotColor: 'bg-orange-500', label: 'Atrasado' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };
  
  if (isLoading && transacoes.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando transações...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200/80 shadow-md bg-white">
      <Table className="min-w-full">
        <TableHeader className="bg-lawyer-dark">
          <TableRow className="hover:bg-lawyer-dark/90">
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo / Descrição</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">Valor</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Categoria</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Data</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/70">
          {transacoes.length > 0 ? (
            transacoes.map((transacao) => {
              const statusStyle = getStatusBadgeStyles(transacao.status_pagamento);
              const isReceita = transacao.tipo_transacao === 'Receita';
              return (
                <TableRow key={transacao.id} className="hover:bg-gray-50/60 transition-colors text-left">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className={cn("text-sm font-medium flex items-center", isReceita ? 'text-green-600' : 'text-red-600')}>
                        {isReceita ? <TrendingUp size={14} className="mr-1.5 opacity-80 flex-shrink-0" /> : <TrendingDown size={14} className="mr-1.5 opacity-80 flex-shrink-0" />}
                        {transacao.tipo_transacao}
                    </div>
                    <div className="text-xs text-gray-700 mt-0.5 truncate max-w-xs" title={transacao.descricao}>
                        {transacao.descricao}
                    </div>
                  </TableCell>
                  <TableCell className={cn("px-4 py-3 whitespace-nowrap text-sm font-medium hidden sm:table-cell", isReceita ? 'text-green-600' : 'text-red-600')}>
                    R$ {Number(transacao.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{transacao.categoria}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{formatDateString(transacao.data_transacao)}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      title={`Status: ${statusStyle.label}`}
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => onEdit(transacao)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(transacao.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
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
                 <BadgePercent className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium mb-1">Nenhuma transação encontrada.</p>
                <p className="text-sm">
                  {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Transação\" para adicionar."}
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransacaoTable;