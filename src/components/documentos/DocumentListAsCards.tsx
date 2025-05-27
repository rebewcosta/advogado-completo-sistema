// src/components/documentos/DocumentListAsCards.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { format } from 'date-fns'; // Usado para formatar data se necessário, ex: event.data_vencimento
import { ptBR } from 'date-fns/locale';
import { MoreVertical, Eye, Download, Trash2, FileText as FileIcon, User, Briefcase, CalendarDays, HardDrive, FilePlus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useDocumentos } from '@/hooks/useDocumentos'; // Para obter ações e formatarTamanhoArquivo
import type { Document as DocumentType } from '@/hooks/useDocumentTypes';

interface DocumentListAsCardsProps {
  documents: DocumentType[];
  isLoading: boolean;
  searchTerm: string;
  filterType: string;
  onRefresh: () => void;
  onUploadClick: () => void;
  error: string | null;
}

const DocumentListAsCards: React.FC<DocumentListAsCardsProps> = ({
  documents,
  isLoading,
  searchTerm,
  filterType,
  onRefresh,
  onUploadClick,
  error
}) => {
  const { obterUrlDocumento, excluirDocumento, formatarTamanhoArquivo, espacoDisponivel, isRefreshing } = useDocumentos();

  const handleDocumentAction = async (action: 'view' | 'download' | 'delete', doc: DocumentType) => {
    switch (action) {
      case 'view':
        try {
          const url = await obterUrlDocumento(doc.path);
          window.open(url, '_blank');
        } catch (err) {
          console.error('Erro ao visualizar documento:', err);
        }
        break;
      case 'download':
        try {
          const url = await obterUrlDocumento(doc.path);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.nome;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (err) {
          console.error('Erro ao baixar documento:', err);
        }
        break;
      case 'delete':
        if (window.confirm(`Tem certeza que deseja excluir o documento "${doc.nome}"?`)) {
            try {
                await excluirDocumento(doc.id, doc.path);
            } catch (err) {
                console.error('Erro ao excluir documento:', err);
            }
        }
        break;
    }
  };


  if (isLoading && documents.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col justify-center items-center h-64">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-3">Carregando documentos...</p>
      </div>
    );
  }
  
  const columnConfig = [
    { id: 'nome', label: "Nome do Arquivo", headerClass: "flex-1 min-w-0 px-4 text-left", itemClass: "flex-1 min-w-0 px-4 text-left" },
    { id: 'tipo', label: "Tipo", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden md:block" },
    { id: 'cliente', label: "Cliente", headerClass: "w-2/12 min-w-0 px-4 text-left hidden md:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left" },
    { id: 'processo', label: "Processo", headerClass: "w-2/12 min-w-0 px-4 text-left hidden lg:flex items-center", itemClass: "w-full md:w-2/12 min-w-0 px-4 text-left hidden lg:block" },
    { id: 'data', label: "Data Envio", headerClass: "w-[120px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[120px] flex-shrink-0 px-4 text-left hidden sm:block" },
    { id: 'tamanho', label: "Tamanho", headerClass: "w-[100px] flex-shrink-0 px-4 text-left hidden sm:flex items-center", itemClass: "w-full md:w-[100px] flex-shrink-0 px-4 text-left hidden sm:block" },
    { id: 'acoes', label: "Ações", headerClass: "w-[80px] flex-shrink-0 px-4 text-right flex items-center justify-end", itemClass: "w-full md:w-[80px] flex-shrink-0 flex justify-start md:justify-end items-start" }
  ];


  if (error && documents.length === 0) {
    return (
         <div className="px-6 py-16 text-center text-gray-500 bg-white rounded-lg shadow-md border border-red-200">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-3" />
            <p className="font-medium text-red-600 mb-1">Erro ao Carregar Documentos</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isRefreshing}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "Atualizando..." : "Tentar novamente"}
            </Button>
        </div>
    );
  }


  return (
    <div className="mt-2">
      {documents.length > 0 && (
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

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            return (
              <Card key={doc.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg border border-gray-200/80 overflow-hidden">
                <div className={cn("p-3 md:py-2 md:flex md:flex-row md:items-start")}>
                  
                  {/* Nome do Arquivo */}
                  <div className={cn(columnConfig[0].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[0].label}</div>
                    <div className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer break-words flex items-center" onClick={() => handleDocumentAction('view', doc)}>
                        <FileIcon size={14} className="mr-1.5 text-gray-500" /> {doc.nome}
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className={cn(columnConfig[1].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[1].label}</div>
                    <div className="text-sm text-gray-600 break-words capitalize">{doc.tipo}</div>
                  </div>
                  
                  {/* Cliente */}
                  <div className={cn(columnConfig[2].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[2].label}</div>
                    <div className="text-xs text-gray-700 break-words flex items-center">
                        <User size={12} className="mr-1 text-gray-400"/> {doc.cliente}
                    </div>
                  </div>

                  {/* Processo */}
                   <div className={cn(columnConfig[3].itemClass, "mb-2 md:mb-0 md:py-2")}>
                    <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[3].label}</div>
                    <div className="text-xs text-gray-700 break-words flex items-center">
                        {doc.processo ? <><Briefcase size={12} className="mr-1 text-gray-400"/> {doc.processo}</> : '-'}
                    </div>
                  </div>
                  
                  {/* Data Envio */}
                  <div className={cn(columnConfig[4].itemClass, "text-sm md:py-2 mb-2 md:mb-0")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[4].label}</div>
                     <span className="text-gray-700 text-xs">{format(new Date(doc.created_at), "dd/MM/yy", { locale: ptBR })}</span>
                  </div>

                  {/* Tamanho */}
                  <div className={cn(columnConfig[5].itemClass, "text-sm md:py-2 mb-2 md:mb-0")}>
                     <div className="md:hidden text-[10px] font-bold text-gray-400 uppercase mb-0.5">{columnConfig[5].label}</div>
                     <span className="text-gray-700 text-xs">{formatarTamanhoArquivo(doc.tamanho_bytes)}</span>
                  </div>

                  {/* Ações */}
                  <div className={cn(columnConfig[6].itemClass, "mt-3 md:mt-0 md:py-1")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => handleDocumentAction('view', doc)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Eye className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDocumentAction('download', doc)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100">
                          <Download className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => handleDocumentAction('delete', doc)}
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
            <FileIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium mb-1">Nenhum documento encontrado.</p>
            <p className="text-sm mb-4">
            {searchTerm || filterType !== 'all' ? "Tente ajustar sua busca ou filtros." : "Clique em \"Enviar Documento\" para adicionar."}
            </p>
            {!searchTerm && filterType === 'all' && (
                <Button
                    variant="outline"
                    onClick={onUploadClick}
                    disabled={espacoDisponivel < 1024 || isLoading}
                >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Enviar Documento
                </Button>
            )}
        </div>
      )}
    </div>
  );
};

export default DocumentListAsCards;