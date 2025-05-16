import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FileText, MoreVertical, Download, Trash2, Eye, File, FilePlus, RefreshCw } from 'lucide-react';
import { Document } from '@/hooks/useDocumentTypes'; // Seu tipo Document
import { formatDate } from '@/lib/utils';
import { useDocumentos } from '@/hooks/useDocumentos';

interface DocumentListProps {
  documents: Document[]; // Seu tipo Document
  isLoading: boolean;
  isRefreshing: boolean;
  searchTerm: string;
  filterType: string;
  onRefresh: () => void;
  onUploadClick: () => void;
  error: string | null;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  isRefreshing,
  searchTerm,
  filterType,
  onRefresh,
  onUploadClick,
  error
}) => {
  const { obterUrlDocumento, excluirDocumento, formatarTamanhoArquivo, espacoDisponivel } = useDocumentos();

  // Manipular ações de documento
  const handleDocumentAction = async (action: string, doc: Document) => { // Renomeado para 'doc' para evitar conflito
    switch (action) {
      case 'view':
        try {
          const url = await obterUrlDocumento(doc.path);
          window.open(url, '_blank');
        } catch (error) {
          console.error('Erro ao visualizar documento:', error);
        }
        break;

      case 'download':
        try {
          const url = await obterUrlDocumento(doc.path);

          // Criar um link temporário para download
          // Corrigido: usar window.document para se referir ao DOM
          const a = window.document.createElement('a');
          a.href = url;
          a.download = doc.nome; // Usar doc.nome (o parâmetro da função)
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
        } catch (error) {
          console.error('Erro ao baixar documento:', error);
        }
        break;

      case 'delete':
        try {
          await excluirDocumento(doc.id, doc.path);
        } catch (error) {
          console.error('Erro ao excluir documento:', error);
        }
        break;

      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Carregando documentos...</p>
      </div>
    );
  }

  if (documents.length === 0 && !isLoading) { // Adicionado !isLoading para evitar piscar
    return (
      <div className="py-12 text-center">
        <File className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium">Nenhum documento encontrado</h3>
        <p className="mt-1 text-gray-500">
          {searchTerm || filterType !== 'all' ?
            'Tente ajustar seus filtros de busca' :
            'Comece enviando seu primeiro documento'}
        </p>
        {!searchTerm && filterType === 'all' && !error && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onUploadClick}
            disabled={espacoDisponivel < 1024} // Desabilitar se menos de 1KB disponível
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Enviar documento
          </Button>
        )}
        {error && ( // Mostrar botão de tentar novamente se houver erro
          <Button
            variant="outline"
            className="mt-4"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Atualizando..." : "Tentar novamente"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Processo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead className="w-[80px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => ( // Renomeado para 'doc' para evitar conflito
          <TableRow key={doc.id}>
            <TableCell className="font-medium">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                {doc.nome}
              </div>
            </TableCell>
            <TableCell className="capitalize">{doc.tipo}</TableCell>
            <TableCell>{doc.cliente}</TableCell>
            <TableCell>{doc.processo || '-'}</TableCell>
            <TableCell>{formatDate(doc.created_at)}</TableCell>
            <TableCell>{formatarTamanhoArquivo(doc.tamanho_bytes)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDocumentAction('view', doc)}>
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Visualizar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDocumentAction('download', doc)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDocumentAction('delete', doc)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentList;