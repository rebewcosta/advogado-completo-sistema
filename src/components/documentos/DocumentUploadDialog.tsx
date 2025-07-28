
import React, { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Info, Upload, FileText, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import LowStorageWarning from './LowStorageWarning';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  espacoDisponivel?: number;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  espacoDisponivel = 0
}) => {
  const isMobile = useIsMobile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [clienteAssociado, setClienteAssociado] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Provide dummy functions for the hook parameters
  const onUploadSuccess = async () => {
    // This would normally refresh the document list
  };
  
  const calcularEspacoDisponivel = async () => {
    // This would normally calculate available space
    return espacoDisponivel || 10 * 1024 * 1024; // 10MB default
  };
  
  const { uploadDocumento, isUploading, uploadError } = useDocumentUpload(
    onUploadSuccess,
    calcularEspacoDisponivel
  );

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Arquivo muito grande. O tamanho máximo é 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !documentType) {
      alert('Por favor, selecione um arquivo e especifique o tipo de documento.');
      return;
    }

    try {
      await uploadDocumento(selectedFile, documentType, clienteAssociado);
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      setClienteAssociado('');
      onClose();
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  
  // Mobile full-screen dialog
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[9999] bg-white"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: '100dvh',
              overscrollBehavior: 'contain',
              touchAction: 'manipulation'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Upload de Documentos
                </h2>
                <button onClick={() => onClose()} className="text-white">
                  ✕
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50 p-4"
              style={{
                height: 'calc(100dvh - 140px)',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              <div className="space-y-6">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <p className="text-gray-600">Clique ou arraste arquivos aqui para fazer upload</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-4 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => onClose()}
                  className="px-4 py-2 border rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 rounded-xl"
        style={{
          touchAction: 'manipulation',
          overscrollBehavior: 'contain'
        }}
      >
        <div className="h-full flex flex-col rounded-xl overflow-hidden">
          {/* Header com gradiente azul */}
          <div className="p-6">
            <TooltipProvider>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-semibold">
                    Upload de Documento
                  </h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-blue-200 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Faça o upload de documentos para organizar e gerenciar seus arquivos. Arquivos até 10MB são suportados.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 -mr-2 -mt-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </TooltipProvider>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {/* Campos do formulário com fundo branco */}
            <div className="bg-white mx-6 rounded-xl p-6 flex-1 overflow-y-auto">
              <LowStorageWarning espacoDisponivel={espacoDisponivel} />
              
              <div className="space-y-6">
                {/* Área de upload */}
                <div>
                  <Label className="text-gray-700 font-medium">Arquivo *</Label>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : selectedFile 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          Arraste e solte um arquivo aqui ou
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-input')?.click()}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Selecionar arquivo
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Tamanho máximo: 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="documentType" className="text-gray-700 font-medium">Tipo de Documento *</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg">
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="ata">Ata</SelectItem>
                        <SelectItem value="procuracao">Procuração</SelectItem>
                        <SelectItem value="certidao">Certidão</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="clienteAssociado" className="text-gray-700 font-medium">Cliente Associado</Label>
                    <Input
                      id="clienteAssociado"
                      value={clienteAssociado}
                      onChange={(e) => setClienteAssociado(e.target.value)}
                      placeholder="Nome do cliente (opcional)"
                      className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-700">{uploadError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer com gradiente azul e botões */}
            <div className="p-6">
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6 py-3 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="px-6 py-3 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                  disabled={isUploading || !selectedFile || !documentType}
                >
                  {isUploading ? 'Enviando...' : 'Fazer Upload'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
