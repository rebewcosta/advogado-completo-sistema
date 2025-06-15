
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileType, Download, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ConversionType = 'pdf-to-docx' | 'docx-to-pdf' | 'txt-to-pdf' | 'html-to-pdf';

export const ConversorDocumentos: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionType, setConversionType] = useState<ConversionType>('pdf-to-docx');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);

  const conversionOptions = [
    { value: 'pdf-to-docx', label: 'PDF para Word (.docx)', accepts: '.pdf' },
    { value: 'docx-to-pdf', label: 'Word para PDF (.pdf)', accepts: '.docx,.doc' },
    { value: 'txt-to-pdf', label: 'Texto para PDF (.pdf)', accepts: '.txt' },
    { value: 'html-to-pdf', label: 'HTML para PDF (.pdf)', accepts: '.html,.htm' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setConvertedFileUrl(null);
    }
  };

  const getOutputExtension = (type: ConversionType): string => {
    switch (type) {
      case 'pdf-to-docx':
        return 'docx';
      case 'docx-to-pdf':
      case 'txt-to-pdf':
      case 'html-to-pdf':
        return 'pdf';
      default:
        return 'pdf';
    }
  };

  const simulateConversion = async (file: File, type: ConversionType): Promise<Blob> => {
    // Simula o processo de conversão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Para demonstração, retorna um blob vazio com o tipo MIME correto
    const outputExtension = getOutputExtension(type);
    const mimeType = outputExtension === 'docx' 
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';
    
    return new Blob(['Arquivo convertido (demonstração)'], { type: mimeType });
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo para converter.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const convertedBlob = await simulateConversion(selectedFile, conversionType);
      
      // Cria URL para download
      const url = URL.createObjectURL(convertedBlob);
      setConvertedFileUrl(url);
      
      toast({
        title: "Conversão concluída!",
        description: "Seu arquivo foi convertido com sucesso. Clique em 'Baixar' para salvar.",
      });
      
    } catch (error) {
      toast({
        title: "Erro na conversão",
        description: "Não foi possível converter o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFileUrl || !selectedFile) return;
    
    const outputExtension = getOutputExtension(conversionType);
    const originalName = selectedFile.name.split('.')[0];
    const fileName = `${originalName}_convertido.${outputExtension}`;
    
    const link = document.createElement('a');
    link.href = convertedFileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: `Arquivo ${fileName} está sendo baixado.`,
    });
  };

  const selectedOption = conversionOptions.find(opt => opt.value === conversionType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileType className="h-5 w-5" />
          Conversor de Documentos
        </CardTitle>
        <CardDescription>
          Converta seus documentos entre diferentes formatos (PDF, Word, TXT, HTML)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="conversion-type">Tipo de Conversão</Label>
            <Select value={conversionType} onValueChange={(value: ConversionType) => setConversionType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo de conversão" />
              </SelectTrigger>
              <SelectContent>
                {conversionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file-upload">Arquivo para Conversão</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept={selectedOption?.accepts}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleConvert} 
              disabled={!selectedFile || isConverting}
              className="flex-1"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Convertendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Converter Arquivo
                </>
              )}
            </Button>
            
            {convertedFileUrl && (
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Convertido
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Funcionalidade em Demonstração</p>
              <p>
                Esta ferramenta está em modo demonstração. Para implementação completa, 
                seria necessário integrar bibliotecas como PDF-lib, docx, ou serviços 
                de conversão online como CloudConvert.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Formatos Suportados:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• PDF ↔ Word (.docx)</li>
            <li>• Texto (.txt) → PDF</li>
            <li>• HTML (.html) → PDF</li>
            <li>• Preservação de formatação básica</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
