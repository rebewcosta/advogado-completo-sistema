
// src/components/financeiro/TransacaoListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash2, TrendingUp, TrendingDown, Circle, BadgePercent } from 'lucide-react';
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

  const columnConfig = [
    { id: 'tipoDescricao', label: "Tipo / Descrição", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0" },
    { id: 'valor', label: "Valor", headerClass: "w-[130px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[130px] flex-shrink-0" },
    { id: 'categoria', label: "Categoria", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0" },
    { id: 'data', label: "Data", headerClass: "w-[100px] flex-shrink-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-[100px] flex-shrink-0" },
    { id: 'status', label: "Status", headerClass: "w-[120px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[120px] flex-shrink-0" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-end md:justify-end items-center" }
  ];

  return (
    <div className="mt-4 animate-fade-in">
      {transacoes.length > 0 && (
        <div className="hidden md:flex bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-t-2xl mb-2 shadow-lg items-center">
          {columnConfig.map(col => (
            <div key={col.id} className={cn(col.headerClass, "text-xs font-bold uppercase tracking-wider")}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {transacoes.length > 0 ? (
        <div className="space-y-4">
          {transacoes.map((transacao, index) => {
            const statusStyle = getStatusBadgeStyles(transacao.status_pagamento);
            const isReceita = transacao.tipo_transacao === 'Receita';
            return (
              <Card 
                key={transacao.id} 
                className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden hover:scale-[1.02] animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-4 md:p-0 md:flex md:flex-row md:items-start">
                  
                  <div className={cn(columnConfig[0].itemClass, "px-4 md:px-6 py-3 md:py-4")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[0].label}</div>
                    <div className={cn("text-sm font-medium break-words flex items-center", isReceita ? 'text-green-600' : 'text-red-600')}>
                        {isReceita ? <TrendingUp size={14} className="mr-2 opacity-80 flex-shrink-0" /> : <TrendingDown size={14} className="mr-2 opacity-80 flex-shrink-0" />}
                        {transacao.tipo_transacao}
                    </div>
                    <div className="text-xs text-gray-700 mt-1 break-words" title={transacao.descricao}>
                        {transacao.descricao.substring(0,60)}{transacao.descricao.length > 60 ? '...' : ''}
                    </div>
                  </div>

                  <div className={cn(columnConfig[1].itemClass, "px-4 md:px-6 py-2 md:py-4")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[1].label}</div>
                    <div className={cn("text-sm font-medium", isReceita ? 'text-green-600' : 'text-red-600')}>
                        R$ {Number(transacao.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className={cn(columnConfig[2].itemClass, "px-4 md:px-6 py-2 md:py-4")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[2].label}</div>
                    <div className="text-xs text-gray-600 break-words">{transacao.categoria}</div>
                  </div>

                  <div className={cn(columnConfig[3].itemClass, "px-4 md:px-6 py-2 md:py-4")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[3].label}</div>
                    <div className="text-xs text-gray-600">{formatDateString(transacao.data_transacao)}</div>
                  </div>
                  
                  <div className={cn(columnConfig[4].itemClass, "px-4 md:px-6 py-2 md:py-4")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-1">{columnConfig[4].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-3 font-medium rounded-full w-max backdrop-blur-sm border-transparent shadow-sm", statusStyle.bgColor, statusStyle.textColor)}
                      title={`Status: ${statusStyle.label}`}
                    >
                      <Circle className={cn("mr-1.5 h-1.5 w-1.5 fill-current", statusStyle.dotColor)} />
                      {statusStyle.label}
                    </Badge>
                  </div>

                  <div className={cn(columnConfig[5].itemClass, "px-4 md:px-6 py-2 md:py-4")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-white/40 rounded-lg transition-all duration-200">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl">
                        <DropdownMenuItem onClick={() => onEdit(transacao)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50/80 rounded-lg transition-all duration-200">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200/50"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(transacao.id)}
                          className="text-red-600 hover:!bg-red-50/80 focus:!bg-red-50/80 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 rounded-lg transition-all duration-200"
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
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8">
          <div className="px-6 py-16 text-center text-gray-500 flex flex-col items-center">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <BadgePercent className="h-12 w-12 text-blue-500" />
            </div>
            <p className="font-medium mb-1">Nenhuma transação encontrada.</p>
            <p className="text-sm">
              {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Nova Transação\" para adicionar."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransacaoListAsCards;
