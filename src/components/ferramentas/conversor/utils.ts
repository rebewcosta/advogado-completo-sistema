
import { ConversionType } from './types';

// Importação condicional para evitar erros de build
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
  // Para conversão Word para PDF, seria necessário uma biblioteca específica
  // Por enquanto, vamos simular criando um PDF com o nome do arquivo
  if (!PDFDocument) throw new Error('PDF-lib não disponível');
  
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage();
  
  page.drawText(`Conversão do arquivo: ${file.name}`, {
    x: 50,
    y: 700,
    size: 16,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Nota: Esta é uma conversão simulada.', {
    x: 50,
    y: 650,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('Para conversão completa de Word para PDF,', {
    x: 50,
    y: 620,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText('seria necessária uma biblioteca especializada.', {
    x: 50,
    y: 590,
    size: 12,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  return await pdfDoc.save();
};

export const convertPDFToWord = async (file: File): Promise<Uint8Array> => {
  // Simulação de conversão PDF para Word
  // Retornamos um arquivo de texto simples como demonstração
  const text = `Conversão simulada do arquivo PDF: ${file.name}\n\nEsta é uma demonstração da funcionalidade de conversão PDF para Word.\n\nPara uma conversão completa, seria necessária uma biblioteca especializada para extrair texto e formatação do PDF.`;
  
  const blob = new Blob([text], { type: 'text/plain' });
  return new Uint8Array(await blob.arrayBuffer());
};

export const convertPDFToJPG = async (file: File): Promise<Uint8Array[]> => {
  // Simulação de conversão PDF para JPG
  // Criamos uma imagem canvas simples para demonstração
  const canvas = document.createElement('canvas');
  canvas.width = 595; // Largura A4 em pontos
  canvas.height = 842; // Altura A4 em pontos
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fundo branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto indicando conversão
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('Conversão simulada', 50, 100);
    ctx.font = '16px Arial';
    ctx.fillText(`Arquivo: ${file.name}`, 50, 150);
    ctx.fillText('PDF para JPG', 50, 200);
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
