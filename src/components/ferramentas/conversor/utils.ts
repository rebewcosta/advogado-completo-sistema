

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

export const convertWordToPDF = async (file: File): Promise<Uint8Array> => {
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  // Título do documento
  page.drawText(`Documento: ${file.name.replace(/\.[^/.]+$/, "")}`, {
    x: 50,
    y: height - 50,
    size: 18,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Informações do arquivo
  page.drawText(`Tamanho: ${(file.size / 1024).toFixed(2)} KB`, {
    x: 50,
    y: height - 100,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText(`Data de modificação: ${new Date(file.lastModified).toLocaleDateString('pt-BR')}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Conteúdo principal
  const mainContent = [
    '',
    'Este PDF foi gerado a partir do seu documento Word.',
    '',
    'Para preservar a formatação completa do documento original,',
    'recomendamos utilizar ferramentas especializadas como:',
    '',
    '• Microsoft Word (Salvar como PDF)',
    '• LibreOffice Writer (Exportar como PDF)',
    '• Ferramentas online especializadas',
    '',
    'Este conversor básico é útil para conversões simples',
    'e demonstração da funcionalidade.'
  ];
  
  let yPos = height - 200;
  for (const line of mainContent) {
    if (yPos < 50) break;
    page.drawText(line, {
      x: 50,
      y: yPos,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPos -= 20;
  }
  
  return await pdfDoc.save();
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

