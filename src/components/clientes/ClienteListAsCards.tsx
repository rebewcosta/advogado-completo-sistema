// src/components/clientes/ClienteListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, User as UserIcon, Users, Mail, Phone } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { Database } from '@/integrations/supabase/types';

type Cliente = Database['public']['Tables']['clientes']['Row'];

interface ClienteListAsCardsProps {
  clients: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onView: (cliente: Cliente) => void;
  onToggleStatus: (cliente: Cliente) => void;
  onDelete: (clienteId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

const ClienteListAsCards: React.FC<ClienteListAsCardsProps> = ({
  clients,
  onEdit,
  onView,
  onToggleStatus,
  onDelete,
  isLoading,
  searchTerm
}) => {

  const getStatusStyles = (status?: string | null): {textColor: string, bgColor: string, dotColor: string, label: string} => {
    switch (status) {
      case 'Ativo': return { textColor: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500', label: 'Ativo' };
      case 'Inativo': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Inativo' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando clientes...</p>
      </div>
    );
  }

  const columnConfig = [
    { id: 'nome', label: "Nome / CPF ou CNPJ", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'contato', label: "Contato", headerClass: "w-4/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-4/12 min-w-0 px-4 text-left" },
    { id: 'tipo', label: "Tipo", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden md:block" },
    { id: 'status', label: "Status", headerClass: "w-[130px] flex-shrink-0 px-4 text-left flex items-center", itemClass: "w-full md:w-[130px] flex-shrink-0 px-4 text-left" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];

  return (
    <div className="mt-2">
      {clients.length > 0 && (
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

      {clients.length > 0 ? (
        <div className="space-y-3">
          {clients.map((client) => {
            const statusStyle = getStatusStyles(client.status_cliente);
            return (
              <Card key={client.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border border-gray-200/80 overflow-hidden">
                <div className={cn("p-3 md:py-2 md:flex md:flex-row md:items-start")}>
                  
                  {/* Nome / CPF ou CNPJ */}
                  <div className={cn(columnConfig[0].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer break-words" onClick={() => onView(client)}>
                        {client.nome}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 break-words">{client.cpfCnpj || '-'}</div>
                  </div>

                  {/* Contato (Email/Telefone) */}
                  <div className={cn(columnConfig[1].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <div className="text-xs text-gray-700 break-words flex items-center mb-0.5">
                        <Mail className="h-3 w-3 mr-1.5 text-gray-400"/> {client.email || '-'}
                    </div>
                    <div className="text-xs text-gray-700 break-words flex items-center">
                        <Phone className="h-3 w-3 mr-1.5 text-gray-400"/> {client.telefone || '-'}
                    </div>
                  </div>

                  {/* Tipo Cliente */}
                  <div className={cn(columnConfig[2].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <div className="text-sm text-gray-600 break-words">{client.tipo_cliente}</div>
                  </div>
                  
                  {/* Status */}
                  <div className={cn(columnConfig[3].itemClass, "mb-2 md:mb-0 md:py-2")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-0.5 px-2 font-medium rounded-full cursor-pointer w-max", statusStyle.bgColor, statusStyle.textColor, `border-transparent`)}
                      onClick={() => onToggleStatus(client)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1 h-1.5 w-1.5 fill-current", statusStyle.dotColor, `text-[${statusStyle.dotColor}]`)} />
                      {statusStyle.label}
                    </Badge>
                  </div>

                  {/* Ações */}
                  <div className={cn(columnConfig[4].itemClass, "mt-3 md:mt-0 md:py-1")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg">
                        <DropdownMenuItem onClick={() => onView(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(client.id)}
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
        <div className="px-6 py-16 text-center text-gray-500">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium mb-1">Nenhum cliente encontrado.</p>
          <p className="text-sm">
            {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Novo Cliente\" para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClienteListAsCards;