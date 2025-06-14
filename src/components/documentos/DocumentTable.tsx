
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MoreVertical, Download, Trash2, Eye, File, FilePlus, RefreshCw } from 'lucide-react';
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
import { Document } from '@/hooks/useDocumentTypes';
import { formatDate } from '@/lib/utils';
import { useDocumentos } from '@/hooks/useDocumentos';

interface DocumentTableProps {
  documents: Document[];
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
  const { obterUrlDocumento, excluirDocumento, formatarTamanhoArquivo, espacoDisponivel } = useDocumentos();

  const handleDocumentAction = async (action: string, doc: Document) => {
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
          const a = window.document.createElement('a');
          a.href = url;
          a.download = doc.nome;
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
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
        <CardContent className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Carregando documentos...</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0 && !isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
        <CardContent className="py-12 text-center">
          <File className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">Nenhum documento encontrado</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || filterType !== 'all' ?
              'Tente ajustar seus filtros de busca' :
              'Comece enviando seu primeiro documento'}
          </p>
          {!searchTerm && filterType === 'all' && !error && (
            <Button
              variant="outline"
              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              onClick={onUploadClick}
              disabled={espacoDisponivel < 1024}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Enviar documento
            </Button>
          )}
          {error && (
            <Button
              variant="outline"
              className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Atualizando..." : "Tentar novamente"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl animate-slide-in">
      <CardHeader className="border-b border-white/20 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-t-2xl">
        <CardTitle className="text-gray-800 font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Documentos ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/20 hover:bg-blue-50/50">
                <TableHead className="text-gray-700 font-medium">Nome</TableHead>
                <TableHead className="text-gray-700 font-medium">Tipo</TableHead>
                <TableHead className="text-gray-700 font-medium">Cliente</TableHead>
                <TableHead className="text-gray-700 font-medium">Processo</TableHead>
                <TableHead className="text-gray-700 font-medium">Data</TableHead>
                <TableHead className="text-gray-700 font-medium">Tamanho</TableHead>
                <TableHead className="w-[80px] text-gray-700 font-medium">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow 
                  key={doc.id} 
                  className="border-b border-white/10 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">{doc.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-gray-600 bg-blue-100 px-2 py-1 rounded-lg text-xs font-medium">
                      {doc.tipo}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-700">{doc.cliente}</TableCell>
                  <TableCell className="text-gray-700">{doc.processo || '-'}</TableCell>
                  <TableCell className="text-gray-700">{formatDate(doc.created_at)}</TableCell>
                  <TableCell className="text-gray-700">{formatarTamanhoArquivo(doc.tamanho_bytes)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl"
                      >
                        <DropdownMenuItem 
                          onClick={() => handleDocumentAction('view', doc)}
                          className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDocumentAction('download', doc)}
                          className="text-gray-700 hover:bg-blue-50 focus:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDocumentAction('delete', doc)} 
                          className="text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg cursor-pointer"
                        >
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentTable;
