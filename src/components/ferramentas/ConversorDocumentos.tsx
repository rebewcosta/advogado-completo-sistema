
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileType } from 'lucide-react';
import { ConversionType } from './conversor/types';
import { ConversionForm } from './conversor/ConversionForm';
import { FeaturesInfo } from './conversor/FeaturesInfo';
import { 
  checkLibrariesAvailable,
  createPDFFromText,
  createPDFFromHTML,
  mergePDFs,
  splitPDF,
  downloadFiles
} from './conversor/utils';

export const ConversorDocumentos: React.FC = () => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [conversionType, setConversionType] = useState<ConversionType>('txt-to-pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [textContent, setTextContent] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const handleConvert = async () => {
    if (!selectedFiles && !textContent && conversionType !== 'txt-to-pdf') {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo para converter.",
        variant: "destructive",
      });
      return;
    }

    if (!checkLibrariesAvailable()) {
      toast({
        title: "Bibliotecas não disponíveis",
        description: "As bibliotecas necessárias para conversão não estão carregadas.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      let result: Uint8Array | Uint8Array[];
      
      switch (conversionType) {
        case 'txt-to-pdf':
          if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            const text = await file.text();
            result = await createPDFFromText(text);
          } else if (textContent) {
            result = await createPDFFromText(textContent);
          } else {
            throw new Error('Nenhum texto fornecido');
          }
          break;
          
        case 'html-to-pdf':
          if (selectedFiles && selectedFiles[0]) {
            const file = selectedFiles[0];
            const html = await file.text();
            result = await createPDFFromHTML(html);
          } else {
            throw new Error('Nenhum arquivo HTML selecionado');
          }
          break;
          
        case 'pdf-merge':
          if (selectedFiles && selectedFiles.length > 1) {
            const filesArray = Array.from(selectedFiles);
            result = await mergePDFs(filesArray);
          } else {
            throw new Error('Selecione pelo menos 2 arquivos PDF');
          }
          break;
          
        case 'pdf-split':
          if (selectedFiles && selectedFiles[0]) {
            result = await splitPDF(selectedFiles[0]);
          } else {
            throw new Error('Nenhum arquivo PDF selecionado');
          }
          break;
          
        default:
          throw new Error('Tipo de conversão não suportado');
      }
      
      const message = downloadFiles(result, conversionType);
      
      toast({
        title: "Conversão concluída!",
        description: message,
      });
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      toast({
        title: "Erro na conversão",
        description: "Não foi possível converter o arquivo. Verifique o formato e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileType className="h-5 w-5" />
          Conversor de Documentos
        </CardTitle>
        <CardDescription>
          Converta e manipule seus documentos (PDF, TXT, HTML)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ConversionForm
          conversionType={conversionType}
          setConversionType={setConversionType}
          textContent={textContent}
          setTextContent={setTextContent}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onConvert={handleConvert}
          isConverting={isConverting}
        />
        <FeaturesInfo />
      </CardContent>
    </Card>
  );
};
