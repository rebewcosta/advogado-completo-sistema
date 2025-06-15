
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileType, Download, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Importações condicionais para evitar erros de build
let PDFDocument: any, rgb: any, StandardFonts: any;
let saveAs: any;

try {
  const pdfLib = require('pdf-lib');
  PDFDocument = pdfLib.PDFDocument;
  rgb = pdfLib.rgb;
  StandardFonts = pdfLib.StandardFonts;
} catch (error) {
  console.warn('PDF-lib não disponível:', error);
}

try {
  const fileSaver = require('file-saver');
  saveAs = fileSaver.saveAs;
} catch (error) {
  console.warn('File-saver não disponível:', error);
}

type ConversionType = 'txt-to-pdf' | 'html-to-pdf' | 'pdf-merge' | 'pdf-split';

export const ConversorDocumentos: React.FC = () => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [conversionType, setConversionType] = useState<ConversionType>('txt-to-pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [textContent, setTextContent] = useState('');

  const conversionOptions = [
    { value: 'txt-to-pdf', label: 'Texto para PDF', accepts: '.txt', multiple: false },
    { value: 'html-to-pdf', label: 'HTML para PDF', accepts: '.html,.htm', multiple: false },
    { value: 'pdf-merge', label: 'Unir PDFs', accepts: '.pdf', multiple: true },
    { value: 'pdf-split', label: 'Dividir PDF', accepts: '.pdf', multiple: false }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(files);
    }
  };

  const checkLibrariesAvailable = () => {
    if (!PDFDocument || !saveAs) {
      toast({
        title: "Bibliotecas não disponíveis",
        description: "As bibliotecas necessárias para conversão não estão carregadas.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const createPDFFromText = async (text: string): Promise<Uint8Array> => {
    if (!checkLibrariesAvailable()) throw new Error('Bibliotecas não disponíveis');
    
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    
    const lines = text.split('\n');
    let yPosition = height - 50;
    
    for (const line of lines) {
      if (yPosition < 50) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
        newPage.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
      } else {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
      }
      yPosition -= lineHeight;
    }
    
    return await pdfDoc.save();
  };

  const createPDFFromHTML = async (htmlContent: string): Promise<Uint8Array> => {
    if (!checkLibrariesAvailable()) throw new Error('Bibliotecas não disponíveis');
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Simples conversão HTML para texto (para demonstração)
    const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    const lines = textContent.split('\n');
    
    let yPosition = height - 50;
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    
    for (const line of lines) {
      if (yPosition < 50) break;
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;
    }
    
    return await pdfDoc.save();
  };

  const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
    if (!checkLibrariesAvailable()) throw new Error('Bibliotecas não disponíveis');
    
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    return await mergedPdf.save();
  };

  const splitPDF = async (file: File): Promise<Uint8Array[]> => {
    if (!checkLibrariesAvailable()) throw new Error('Bibliotecas não disponíveis');
    
    const fileBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(fileBuffer);
    const pageCount = sourcePdf.getPageCount();
    
    const splitPdfs: Uint8Array[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      splitPdfs.push(pdfBytes);
    }
    
    return splitPdfs;
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
      
      // Download dos arquivos
      if (Array.isArray(result)) {
        // Múltiplos arquivos (split)
        result.forEach((pdfBytes, index) => {
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          saveAs(blob, `documento_parte_${index + 1}.pdf`);
        });
        
        toast({
          title: "Conversão concluída!",
          description: `${result.length} arquivos foram gerados e baixados.`,
        });
      } else {
        // Arquivo único
        const blob = new Blob([result], { type: 'application/pdf' });
        const fileName = conversionType === 'pdf-merge' ? 'documentos_unidos.pdf' : 'documento_convertido.pdf';
        saveAs(blob, fileName);
        
        toast({
          title: "Conversão concluída!",
          description: "Seu arquivo foi convertido e baixado com sucesso.",
        });
      }
      
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

  const selectedOption = conversionOptions.find(opt => opt.value === conversionType);

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

          {conversionType === 'txt-to-pdf' && (
            <div>
              <Label htmlFor="text-content">Texto para converter (ou selecione arquivo .txt)</Label>
              <textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Digite seu texto aqui ou selecione um arquivo .txt abaixo..."
                className="mt-1 w-full min-h-[150px] p-3 border border-input rounded-md resize-vertical"
              />
            </div>
          )}

          <div>
            <Label htmlFor="file-upload">
              {selectedOption?.multiple ? 'Arquivos' : 'Arquivo'} para Conversão
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept={selectedOption?.accepts}
              multiple={selectedOption?.multiple}
              className="mt-1"
            />
            {selectedFiles && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedFiles.length > 1 
                  ? `${selectedFiles.length} arquivos selecionados`
                  : `Arquivo selecionado: ${selectedFiles[0].name}`
                }
              </p>
            )}
          </div>

          <Button 
            onClick={handleConvert} 
            disabled={(!selectedFiles && !textContent) || isConverting}
            className="w-full"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Convertendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Converter
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Funcionalidades Disponíveis:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Converter texto para PDF</li>
            <li>• Converter HTML para PDF</li>
            <li>• Unir múltiplos PDFs em um arquivo</li>
            <li>• Dividir PDF em páginas separadas</li>
            <li>• Download automático dos arquivos convertidos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
