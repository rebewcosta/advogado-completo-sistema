
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
      case 'Pago': return { textColor: 'text-green-700', bgColor: 'bg-green-100/80', dotColor: 'bg-green-500', label: 'Pago' };
      case 'Recebido': return { textColor: 'text-green-700', bgColor: 'bg-green-100/80', dotColor: 'bg-green-500', label: 'Recebido' };
      case 'Pendente': return { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100/80', dotColor: 'bg-yellow-500', label: 'Pendente' };
      case 'Atrasado': return { textColor: 'text-orange-700', bgColor: 'bg-orange-100/80', dotColor: 'bg-orange-500', label: 'Atrasado' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100/80', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };
  
  if (isLoading && transacoes.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8 animate-fade-in">
        <div className="text-center py-16 flex flex-col justify-center items-center">
          <Spinner size="lg" />
          <p className="text-gray-500 mt-3">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden animate-slide-in">
      <Table className="min-w-full">
        <TableHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <TableRow className="hover:bg-white/5 border-0">
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo / Descrição</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">Valor</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Categoria</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Data</TableHead>
            <TableHead className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</TableHead>
            <TableHead className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/30">
          {transacoes.length > 0 ? (
            transacoes.map((transacao, index) => {
              const statusStyle = getStatusBadgeStyles(transacao.status_pagamento);
              const isReceita = transacao.tipo_transacao === 'Receita';
              return (
                <TableRow 
                  key={transacao.id} 
                  className="hover:bg-white/30 transition-all duration-200 animate-fade-in" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className={cn("text-sm font-medium flex items-center", isReceita ? 'text-green-600' : 'text-red-600')}>
                        {isReceita ? <TrendingUp size={14} className="mr-2 opacity-80 flex-shrink-0" /> : <TrendingDown size={14} className="mr-2 opacity-80 flex-shrink-0" />}
                        {transacao.tipo_transacao}
                    </div>
                    <div className="text-xs text-gray-700 mt-1 truncate max-w-xs" title={transacao.descricao}>
                        {transacao.descricao}
                    </div>
                  </TableCell>
                  <TableCell className={cn("px-6 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell", isReceita ? 'text-green-600' : 'text-red-600')}>
                    R$ {Number(transacao.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{transacao.categoria}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateString(transacao.data_transacao)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-3 font-medium rounded-full w-max backdrop-blur-sm border-transparent shadow-sm", statusStyle.bgColor, statusStyle.textColor)}
                      title={`Status: ${statusStyle.label}`}
                    >
                      <Circle className={cn("mr-1.5 h-1.5 w-1.5 fill-current", statusStyle.dotColor)} />
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-lg transition-all duration-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                        <DropdownMenuItem onClick={() => onEdit(transacao)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50/80 text-left rounded-lg transition-all duration-200">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200/50"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(transacao.id)}
                          className="text-red-600 hover:!bg-red-50/80 focus:!bg-red-50/80 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200"
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
                 <div className="flex flex-col items-center">
                   <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
                     <BadgePercent className="h-12 w-12 text-blue-500" />
                   </div>
                   <p className="font-medium mb-1">Nenhuma transação encontrada.</p>
                   <p className="text-sm">
                     {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Transação\" para adicionar."}
                   </p>
                 </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransacaoTable;
