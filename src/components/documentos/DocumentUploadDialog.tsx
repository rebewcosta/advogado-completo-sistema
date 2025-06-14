
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DocumentType, LIMITE_ARMAZENAMENTO_BYTES } from '@/hooks/useDocumentTypes';
import { useDocumentos } from '@/hooks/useDocumentos';
import DocumentUploadHeader from './DocumentUploadHeader';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('outro');
  const [clientName, setClientName] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  
  const { toast } = useToast();
  const { 
    uploadDocumento, 
    espacoDisponivel, 
    formatarTamanhoArquivo,
    isLoading 
  } = useDocumentos();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar tamanho do arquivo
      if (file.size > LIMITE_ARMAZENAMENTO_BYTES) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo excede o limite máximo de 3MB.`,
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      // Verificar se há espaço suficiente
      if (file.size > espacoDisponivel) {
        toast({
          title: "Espaço insuficiente",
          description: `Você não tem espaço suficiente. Disponível: ${formatarTamanhoArquivo(espacoDisponivel)}`,
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    if (!clientName) {
      toast({
        title: "Erro no upload",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fazer upload do documento
      await uploadDocumento(
        selectedFile,
        documentType,
        clientName,
        processNumber || undefined
      );

      // Fechar diálogo e resetar campos
      onOpenChange(false);
      setSelectedFile(null);
      setDocumentType('outro');
      setClientName('');
      setProcessNumber('');
      
      toast({
        title: "Documento enviado com sucesso",
        description: `${selectedFile.name} foi adicionado à sua biblioteca.`,
      });
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-lawyer-dark border border-blue-600">
        <DocumentUploadHeader />
        <DialogDescription className="text-blue-200">
          Faça upload de um documento e associe-o a um cliente ou processo.
        </DialogDescription>
        
        <form onSubmit={handleUploadSubmit}>
          <div className="grid gap-6 py-4">
            {/* Arquivo */}
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <Label className="text-sm font-semibold text-gray-100 mb-2 block">
                📎 Arquivo
              </Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                disabled={isLoading}
                className="bg-white"
              />
              {selectedFile && (
                <p className="text-xs text-blue-200 mt-2">
                  {selectedFile.name} ({formatarTamanhoArquivo(selectedFile.size)})
                </p>
              )}
              <p className="text-xs text-blue-200 mt-1">
                Limite máximo: 3MB. Espaço disponível: {formatarTamanhoArquivo(espacoDisponivel)}
              </p>
            </div>

            {/* Tipo e Cliente */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <Label className="text-sm font-semibold text-blue-100 mb-3 block">
                📋 Informações do Documento
              </Label>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-blue-100">
                    Tipo de documento
                  </Label>
                  <Select 
                    value={documentType} 
                    onValueChange={(value) => setDocumentType(value as DocumentType)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato</SelectItem>
                      <SelectItem value="petição">Petição</SelectItem>
                      <SelectItem value="procuração">Procuração</SelectItem>
                      <SelectItem value="decisão">Decisão</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client" className="text-blue-100">
                    Cliente <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nome do cliente"
                    required
                    disabled={isLoading}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Processo */}
            <div className="bg-blue-900 p-4 rounded-lg border border-blue-700">
              <Label className="text-sm font-semibold text-gray-100 mb-2 block">
                ⚖️ Processo (Opcional)
              </Label>
              <div className="grid gap-2">
                <Label htmlFor="process" className="text-gray-100">
                  Número do processo
                </Label>
                <Input
                  id="process"
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Ex: 0001234-56.2023.8.26.0000"
                  disabled={isLoading}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-blue-600 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !selectedFile}
              className="bg-lawyer-primary hover:bg-lawyer-primary/90"
            >
              {isLoading ? "Enviando..." : "Enviar documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
