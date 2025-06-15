
import { ConversionType } from './types';

// Imports ES6 para as bibliotecas
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

export const checkLibrariesAvailable = (): boolean => {
  return !!(PDFDocument && saveAs);
};

export const createPDFFromText = async (text: string): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
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

export const createPDFFromHTML = async (htmlContent: string): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
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

const extractTextFromWordFile = async (file: File): Promise<string> => {
  try {
    // Tentativa básica de extração de texto
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Procurar por texto legível no arquivo
    let extractedText = '';
    let currentWord = '';
    
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      
      // Caracteres ASCII imprimíveis
      if (byte >= 32 && byte <= 126) {
        currentWord += String.fromCharCode(byte);
      } else if (byte === 0 || byte === 10 || byte === 13) {
        // Fim de palavra ou quebra de linha
        if (currentWord.length > 2) {
          // Filtrar palavras que parecem ser texto real
          if (!/^[A-Za-z0-9\s\.,!?;:()'"%-]+$/.test(currentWord)) {
            currentWord = '';
            continue;
          }
          extractedText += currentWord + ' ';
        }
        currentWord = '';
        if (byte === 10 || byte === 13) {
          extractedText += '\n';
        }
      } else {
        // Bytes não ASCII - resetar palavra atual
        if (currentWord.length > 2) {
          extractedText += currentWord + ' ';
        }
        currentWord = '';
      }
    }
    
    // Adicionar última palavra se existir
    if (currentWord.length > 2) {
      extractedText += currentWord;
    }
    
    // Limpar texto extraído
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim();
    
    // Se não conseguiu extrair texto suficiente, usar texto padrão
    if (extractedText.length < 50) {
      return `Conteúdo extraído do arquivo: ${file.name}\n\nO texto original do documento Word não pôde ser completamente extraído devido às limitações da conversão no navegador.\n\nInformações do arquivo:\n- Nome: ${file.name}\n- Tamanho: ${(file.size / 1024).toFixed(2)} KB\n- Data de modificação: ${new Date(file.lastModified).toLocaleDateString('pt-BR')}\n\nPara conversão completa com formatação preservada, recomendamos:\n• Usar Microsoft Word (Salvar como PDF)\n• Usar Google Docs (Arquivo > Download > PDF)\n• Usar LibreOffice Writer (Exportar como PDF)`;
    }
    
    return `Texto extraído do arquivo: ${file.name}\n\n${extractedText}`;
    
  } catch (error) {
    console.error('Erro ao extrair texto:', error);
    return `Conteúdo do arquivo: ${file.name}\n\nNão foi possível extrair o texto do documento Word automaticamente.\n\nInformações do arquivo:\n- Tamanho: ${(file.size / 1024).toFixed(2)} KB\n- Data: ${new Date(file.lastModified).toLocaleDateString('pt-BR')}`;
  }
};

export const convertWordToPDF = async (file: File): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
  // Extrair texto do arquivo Word
  const extractedText = await extractTextFromWordFile(file);
  
  // Criar PDF com o texto extraído
  return await createPDFFromText(extractedText);
};

export const convertPDFToWord = async (file: File): Promise<Uint8Array> => {
  // Para conversão PDF para Word, criamos um arquivo de texto rico
  const header = `Documento extraído de: ${file.name}\n`;
  const separator = '='.repeat(50) + '\n';
  const info = `Data de conversão: ${new Date().toLocaleDateString('pt-BR')}\n`;
  const content = `Tamanho do arquivo original: ${(file.size / 1024).toFixed(2)} KB\n\n`;
  
  const instructions = [
    'INSTRUÇÕES PARA CONVERSÃO COMPLETA:',
    '',
    '1. Para melhor resultado, use ferramentas especializadas:',
    '   • Adobe Acrobat Pro',
    '   • Smallpdf.com',
    '   • ILovePDF.com',
    '',
    '2. Este arquivo contém o texto extraído básico.',
    '',
    '3. Formatação, imagens e layout podem não ser preservados.',
    '',
    '4. Recomendamos revisar o documento após a conversão.',
    '',
    '=' + '='.repeat(48),
    '',
    'CONTEÚDO EXTRAÍDO:',
    '',
    '[O texto do PDF seria extraído aqui]',
    '',
    'Nota: Esta é uma demonstração da funcionalidade.',
    'Para extração completa, seriam necessárias bibliotecas',
    'especializadas em processamento de PDF.'
  ].join('\n');
  
  const fullText = header + separator + info + content + instructions;
  
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  return new Uint8Array(await blob.arrayBuffer());
};

export const convertPDFToJPG = async (file: File): Promise<Uint8Array[]> => {
  // Criamos uma imagem representativa para cada página do PDF
  const canvas = document.createElement('canvas');
  canvas.width = 595; // Largura A4 em pontos
  canvas.height = 842; // Altura A4 em pontos
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fundo branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cabeçalho
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Página extraída de PDF', 50, 100);
    
    // Informações do arquivo
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Arquivo: ${file.name}`, 50, 150);
    ctx.fillText(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`, 50, 180);
    ctx.fillText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 210);
    
    // Linha separadora
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(545, 240);
    ctx.stroke();
    
    // Conteúdo principal
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    const lines = [
      '',
      'Esta imagem representa uma página do seu PDF.',
      '',
      'Para conversão completa PDF → JPG:',
      '',
      '• Use ferramentas especializadas como:',
      '  - Adobe Acrobat',
      '  - GIMP',
      '  - Ferramentas online',
      '',
      '• Mantenha a qualidade original',
      '• Considere o tamanho das imagens',
      '',
      'Esta é uma demonstração da funcionalidade.'
    ];
    
    let yPos = 280;
    for (const line of lines) {
      ctx.fillText(line, 50, yPos);
      yPos += 20;
    }
  }
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        blob.arrayBuffer().then(buffer => {
          resolve([new Uint8Array(buffer)]);
        });
      }
    }, 'image/jpeg', 0.9);
  });
};

export const convertJPGToPDF = async (files: File[]): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
  const pdfDoc = await PDFDocument.create();
  
  for (const file of files) {
    const imageBytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(imageBytes);
    
    let image;
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
      image = await pdfDoc.embedJpg(uint8Array);
    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      image = await pdfDoc.embedPng(uint8Array);
    } else {
      throw new Error('Formato de imagem não suportado');
    }
    
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Calcular dimensões para ajustar a imagem na página
    const imageAspectRatio = image.width / image.height;
    const pageAspectRatio = width / height;
    
    let imageWidth, imageHeight;
    if (imageAspectRatio > pageAspectRatio) {
      imageWidth = width - 100; // margem
      imageHeight = imageWidth / imageAspectRatio;
    } else {
      imageHeight = height - 100; // margem
      imageWidth = imageHeight * imageAspectRatio;
    }
    
    const x = (width - imageWidth) / 2;
    const y = (height - imageHeight) / 2;
    
    page.drawImage(image, {
      x,
      y,
      width: imageWidth,
      height: imageHeight,
    });
  }
  
  return await pdfDoc.save();
};

export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const fileBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
};

export const splitPDF = async (file: File): Promise<Uint8Array[]> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
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

export const downloadFiles = (result: Uint8Array | Uint8Array[], conversionType: ConversionType) => {
  if (!saveAs) throw new Error('File-saver não disponível');
  
  if (Array.isArray(result)) {
    // Múltiplos arquivos (split ou pdf-to-jpg)
    result.forEach((fileBytes, index) => {
      let blob, fileName;
      
      if (conversionType === 'pdf-split') {
        blob = new Blob([fileBytes], { type: 'application/pdf' });
        fileName = `documento_parte_${index + 1}.pdf`;
      } else if (conversionType === 'pdf-to-jpg') {
        blob = new Blob([fileBytes], { type: 'image/jpeg' });
        fileName = `pagina_${index + 1}.jpg`;
      }
      
      if (blob && fileName) {
        saveAs(blob, fileName);
      }
    });
    return `${result.length} arquivos foram gerados e baixados.`;
  } else {
    // Arquivo único
    let blob, fileName;
    
    switch (conversionType) {
      case 'pdf-merge':
        blob = new Blob([result], { type: 'application/pdf' });
        fileName = 'documentos_unidos.pdf';
        break;
      case 'word-to-pdf':
        blob = new Blob([result], { type: 'application/pdf' });
        fileName = 'documento_convertido.pdf';
        break;
      case 'pdf-to-word':
        blob = new Blob([result], { type: 'text/plain' });
        fileName = 'documento_convertido.txt';
        break;
      case 'jpg-to-pdf':
        blob = new Blob([result], { type: 'application/pdf' });
        fileName = 'imagens_convertidas.pdf';
        break;
      default:
        blob = new Blob([result], { type: 'application/pdf' });
        fileName = 'documento_convertido.pdf';
    }
    
    saveAs(blob, fileName);
    return 'Seu arquivo foi convertido e baixado com sucesso.';
  }
};
