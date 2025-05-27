// src/components/financeiro/TransacaoListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash2, TrendingUp, TrendingDown, DollarSign, CalendarDays, Circle, BadgePercent } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Transacao = Database['public']['Tables']['transacoes_financeiras']['Row'];

interface TransacaoListAsCardsProps {
  transacoes: Transacao[];
  onEdit: (transacao: Transacao) => void;
  onDelete: (transacaoId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

const TransacaoListAsCards: React.FC<TransacaoListAsCardsProps> = ({
  transacoes,
  onEdit,
  onDelete,
  isLoading,
  searchTerm
}) => {

  const formatDateString = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-xs text-gray-500">-</span>;
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

  const columnConfig = [
    { id: 'tipoDescricao', label: "Tipo / Descrição", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'valor', label: "Valor", headerClass: "w-[130px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[130px] flex-shrink-0 px-4 text-left hidden sm:block" },
    { id: 'categoria', label: "Categoria", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden md:block" },
    { id: 'data', label: "Data", headerClass: "w-[100px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[100px] flex-shrink-0 px-4 text-left hidden md:block" },
    { id: 'status', label: "Status", headerClass: "w-[120px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[120px] flex-shrink-0 px-4 text-left" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];

  return (
    <div className="mt-2">
      {transacoes.length > 0 && (
        <div className={cn(
            "hidden md:flex bg-lawyer-dark text-white py-3 rounded-t-lg mb-1 shadow-md sticky top-0 z-10 items-center"
        )}>
          {columnConfig.map(col => (
            <div key={col.id} className={cn(col.headerClass, "text-xs font-bold uppercase tracking-wider")}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {transacoes.length > 0 ? (
        <div className="space-y-3">
          {transacoes.map((transacao) => {
            const statusStyle = getStatusBadgeStyles(transacao.status_pagamento);
            const isReceita = transacao.tipo_transacao === 'Receita';
            return (
              <Card key={transacao.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border border-gray-200/80 overflow-hidden">
                <div className={cn("p-3 md:py-2 md:flex md:flex-row md:items-start")}>
                  
                  {/* Tipo / Descrição */}
                  <div className={cn(columnConfig[0].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className={cn("text-sm font-medium break-words flex items-center", isReceita ? 'text-green-600' : 'text-red-600')}>
                        {isReceita ? <TrendingUp size={14} className="mr-1.5 opacity-80" /> : <TrendingDown size={14} className="mr-1.5 opacity-80" />}
                        {transacao.tipo_transacao}
                    </div>
                    <div className="text-xs text-gray-700 mt-0.5 break-words" title={transacao.descricao}>
                        {transacao.descricao.substring(0,60)}{transacao.descricao.length > 60 ? '...' : ''}
                    </div>
                  </div>

                  {/* Valor */}
                  <div className={cn(columnConfig[1].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <div className={cn("text-sm font-medium", isReceita ? 'text-green-600' : 'text-red-600')}>
                        R$ {Number(transacao.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  {/* Categoria */}
                  <div className={cn(columnConfig[2].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <div className="text-xs text-gray-600 break-words">{transacao.categoria}</div>
                  </div>

                  {/* Data */}
                  <div className={cn(columnConfig[3].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    <div className="text-xs text-gray-600">{formatDateString(transacao.data_transacao)}</div>
                  </div>
                  
                  {/* Status */}
                  <div className={cn(columnConfig[4].itemClass, "mb-2 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[4].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2 font-medium rounded-full w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      title={`Status: ${statusStyle.label}`}
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </div>

                  {/* Ações */}
                  <div className={cn(columnConfig[5].itemClass, "mt-3 md:mt-0 md:py-1")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => onEdit(transacao)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(transacao.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-16 text-center text-gray-500 bg-white rounded-lg shadow-md border border-gray-200/80">
          <BadgePercent className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium mb-1">Nenhuma transação encontrada.</p>
          <p className="text-sm">
            {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Transação\" para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default TransacaoListAsCards;