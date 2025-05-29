// src/components/documentos/DocumentTable.tsx
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Spinner } from '@/components/ui/spinner';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreVertical, Eye, Download, Trash2, FileText as FileIcon, User, Briefcase, CalendarDays, RefreshCw, AlertTriangle, FilePlus } from 'lucide-react';
import { useDocumentos } from '@/hooks/useDocumentos';
import type { Document as DocumentType } from '@/hooks/useDocumentTypes';

interface DocumentTableProps {
  documents: DocumentType[];
  isLoading: boolean;
  searchTerm: string;
  filterType: string;
  onRefresh: () => void;
  onUploadClick: () => void;
  error: string | null;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  searchTerm,
  filterType,
  onRefresh,
  onUploadClick,
  error
}) => {
  const { obterUrlDocumento, excluirDocumento, formatarTamanhoArquivo, espacoDisponivel, isRefreshing: isActionRefreshing } = useDocumentos();

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

  if (error && documents.length === 0) {
    return (
         <div className="px-6 py-16 text-center text-gray-500 bg-white rounded-lg shadow-md border border-red-200">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-3" />
            <p className="font-medium text-red-600 mb-1">Erro ao Carregar Documentos</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isLoading || isActionRefreshing}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading || isActionRefreshing ? 'animate-spin' : ''}`} />
                {isLoading || isActionRefreshing ? "Atualizando..." : "Tentar novamente"}
            </Button>
        </div>
    );
  }
  

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200/80 shadow-md bg-white">
      <Table className="min-w-full">
        <TableHeader className="bg-lawyer-dark">
          <TableRow className="hover:bg-lawyer-dark/90">
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Nome do Arquivo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden md:table-cell">Tipo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Cliente</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden lg:table-cell">Processo</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">Data Envio</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider hidden sm:table-cell">Tamanho</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200/70">
          {documents.length > 0 ? (
            documents.map((doc) => {
              return (
                <TableRow key={doc.id} className="hover:bg-gray-50/60 transition-colors text-left">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-lawyer-primary hover:underline cursor-pointer flex items-center"
                      onClick={() => handleDocumentAction('view', doc)}
                    >
                      <FileIcon size={14} className="mr-1.5 text-gray-500 flex-shrink-0" /> {doc.nome}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell capitalize">{doc.tipo}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{doc.cliente}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{doc.processo || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {format(parseISO(doc.created_at), "dd/MM/yy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{formatarTamanhoArquivo(doc.tamanho_bytes)}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 shadow-lg">
                        <DropdownMenuItem onClick={() => handleDocumentAction('view', doc)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Eye className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDocumentAction('download', doc)} className="cursor-pointer text-sm group flex items-center px-3 py-2 hover:bg-gray-100 text-left">
                          <Download className="mr-2 h-4 w-4 text-gray-500 group-hover:text-lawyer-primary" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200"/>
                        <DropdownMenuItem
                          onClick={() => handleDocumentAction('delete', doc)}
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
              <TableCell colSpan={7} className="px-6 py-16 text-center text-gray-500">
                 <FileIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium mb-1">Nenhum documento encontrado.</p>
                <p className="text-sm mb-4">
                  {searchTerm || filterType !== 'all' ? "Tente ajustar sua busca ou filtros." : "Clique em \"Enviar Documento\" para adicionar."}
                </p>
                {!searchTerm && filterType === 'all' && (
                    <Button
                        variant="outline"
                        onClick={onUploadClick}
                        disabled={espacoDisponivel < 1024 || isLoading || isActionRefreshing}
                    >
                        <FilePlus className="mr-2 h-4 w-4" />
                        Enviar Documento
                    </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;