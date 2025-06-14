
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MoreVertical, Download, Trash2, Eye, File, FilePlus, RefreshCw, Calendar, User, Scale } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Document } from '@/hooks/useDocumentTypes';
import { formatDate } from '@/lib/utils';
import { useDocumentos } from '@/hooks/useDocumentos';

interface DocumentListAsCardsProps {
  documents: Document[];
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
    <div className="grid gap-4 md:gap-6">
      {documents.map((doc, index) => (
        <Card 
          key={doc.id} 
          className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-slide-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <span className="truncate">{doc.nome}</span>
              </CardTitle>
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
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mr-2">
                    <FileText className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-500">Tipo:</span>
                  <span className="ml-1 capitalize font-medium bg-blue-100 px-2 py-0.5 rounded-lg text-xs">
                    {doc.tipo}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="p-1.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mr-2">
                    <Calendar className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Data:</span>
                  <span className="ml-1 font-medium">{formatDate(doc.created_at)}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mr-2">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Cliente:</span>
                <span className="ml-1 font-medium truncate">{doc.cliente}</span>
              </div>
              
              {doc.processo && (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="p-1.5 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg mr-2">
                    <Scale className="h-3 w-3 text-yellow-600" />
                  </div>
                  <span className="text-xs text-gray-500">Processo:</span>
                  <span className="ml-1 font-medium truncate">{doc.processo}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {formatarTamanhoArquivo(doc.tamanho_bytes)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentAction('view', doc)}
                    className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentAction('download', doc)}
                    className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentListAsCards;
