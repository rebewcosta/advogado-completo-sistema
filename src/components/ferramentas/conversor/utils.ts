
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
    // Múltiplos arquivos (split)
    result.forEach((pdfBytes, index) => {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `documento_parte_${index + 1}.pdf`);
    });
    return `${result.length} arquivos foram gerados e baixados.`;
  } else {
    // Arquivo único
    const blob = new Blob([result], { type: 'application/pdf' });
    const fileName = conversionType === 'pdf-merge' ? 'documentos_unidos.pdf' : 'documento_convertido.pdf';
    saveAs(blob, fileName);
    return 'Seu arquivo foi convertido e baixado com sucesso.';
  }
};
