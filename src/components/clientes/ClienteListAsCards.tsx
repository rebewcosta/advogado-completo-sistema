
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, ExternalLink, Circle, Trash2, User as UserIcon, Users, Mail, Phone, Building } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
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
      case 'Ativo': return { textColor: 'text-emerald-700', bgColor: 'bg-emerald-100', dotColor: 'bg-emerald-500', label: 'Ativo' };
      case 'Inativo': return { textColor: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500', label: 'Inativo' };
      default: return { textColor: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500', label: status || 'N/D' };
    }
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl">
        <Spinner size="lg" className="text-blue-500" />
        <p className="text-gray-700 mt-4 font-medium">Carregando clientes...</p>
      </div>
    );
  }

  const columnConfig = [
    { id: 'nome', label: "Nome / Documento", baseClass: "flex-1 min-w-0", mdWidthClass: "md:flex-1" },
    { id: 'contato', label: "Contato", baseClass: "w-full md:w-4/12 min-w-0", mdWidthClass: "md:w-4/12" },
    { id: 'tipo', label: "Tipo", baseClass: "w-full md:w-2/12 min-w-0", mdWidthClass: "md:w-2/12" },
    { id: 'status', label: "Status", baseClass: "w-full md:w-[130px] flex-shrink-0", mdWidthClass: "md:w-[130px]" },
    { id: 'acoes', label: "Ações", baseClass: "w-full md:w-[80px] flex-shrink-0 flex justify-end items-center", mdWidthClass: "md:w-[80px] md:justify-end" }
  ];

  return (
    <div className="mt-2 animate-fade-in">
      {clients.length > 0 && (
        <div className={cn(
            "hidden md:flex bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-sm text-white py-4 rounded-t-xl mb-1 shadow-xl items-center px-4 md:px-6"
        )}>
          {columnConfig.map(col => (
            <div key={col.id} className={cn("text-xs font-bold uppercase tracking-wider text-left", col.baseClass, col.mdWidthClass)}>
              {col.label}
            </div>
          ))}
        </div>
      )}

      {clients.length > 0 ? (
        <div className="space-y-4">
          {clients.map((client, index) => {
            const statusStyle = getStatusStyles(client.status_cliente);
            return (
              <Card 
                key={client.id} 
                className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border border-white/20 overflow-hidden hover:scale-[1.02] animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={cn("p-4 md:p-0 md:flex md:flex-row md:items-start")}>
                  
                  <div className={cn(columnConfig[0].baseClass, columnConfig[0].mdWidthClass, "px-3 md:px-6 py-3 md:py-4 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-blue-400 uppercase mb-1">{columnConfig[0].label}</div>
                    <div className="text-sm font-semibold text-blue-900 hover:text-indigo-600 cursor-pointer break-words transition-colors duration-200" onClick={() => onView(client)}>
                        {client.nome}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 break-words font-medium">{client.cpfCnpj || '-'}</div>
                  </div>

                  <div className={cn(columnConfig[1].baseClass, columnConfig[1].mdWidthClass, "px-3 md:px-6 py-3 md:py-4 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-blue-400 uppercase mb-1">{columnConfig[1].label}</div>
                    <div className="text-xs text-gray-700 break-words flex items-center mb-1 font-medium">
                        <Mail className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0"/> {client.email || '-'}
                    </div>
                    <div className="text-xs text-gray-700 break-words flex items-center font-medium">
                        <Phone className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0"/> {client.telefone || '-'}
                    </div>
                  </div>

                  <div className={cn(columnConfig[2].baseClass, columnConfig[2].mdWidthClass, "px-3 md:px-6 py-3 md:py-4 text-left")}>
                    <div className="md:hidden text-[10px] font-bold text-blue-400 uppercase mb-1">{columnConfig[2].label}</div>
                    <div className="text-sm text-gray-700 break-words flex items-center font-medium">
                        {client.tipo_cliente === "Pessoa Física" ? <UserIcon size={14} className="mr-2 text-blue-400"/> : <Building size={14} className="mr-2 text-blue-400"/>}
                        {client.tipo_cliente}
                    </div>
                  </div>
                  
                  <div className={cn(columnConfig[3].baseClass, columnConfig[3].mdWidthClass, "px-3 md:px-6 py-3 md:py-4 text-left")}>
                     <div className="md:hidden text-[10px] font-bold text-blue-400 uppercase mb-1">{columnConfig[3].label}</div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs py-1 px-3 font-semibold rounded-full cursor-pointer w-max border-2 transition-all duration-200 hover:scale-105", statusStyle.bgColor, statusStyle.textColor, `border-current shadow-sm`)}
                      onClick={() => onToggleStatus(client)}
                      title="Clique para alterar status"
                    >
                      <Circle className={cn("mr-1.5 h-2 w-2 fill-current", statusStyle.dotColor)} />
                      {statusStyle.label}
                    </Badge>
                  </div>

                  <div className={cn(columnConfig[4].baseClass, columnConfig[4].mdWidthClass, "px-3 md:px-6 py-3 md:py-4")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-xl border-white/20 bg-white/95 backdrop-blur-sm">
                        <DropdownMenuItem onClick={() => onView(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 text-left">
                          <ExternalLink className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(client)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-blue-50 text-left">
                          <Edit className="mr-2 h-4 w-4 text-gray-500 group-hover:text-blue-600" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => onDelete(client.id)}
                          className="text-red-600 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-600 cursor-pointer text-sm group flex items-center px-3 py-2 text-left"
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
        <div className="px-6 py-16 text-center text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl">
          <Users className="mx-auto h-12 w-12 text-blue-300 mb-4" />
          <p className="font-semibold text-lg mb-2">Nenhum cliente encontrado.</p>
          <p className="text-sm">
            {searchTerm ? "Tente ajustar sua busca." : "Clique em \"Novo Cliente\" para adicionar."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClienteListAsCards;
