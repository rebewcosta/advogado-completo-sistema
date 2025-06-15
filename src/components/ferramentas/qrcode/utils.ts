
import { QRType, EmailData, PhoneData, WifiData, VCardData } from './types';

// Importação ES6 para a biblioteca QRCode
import QRCode from 'qrcode';

export const isQRCodeLibAvailable = (): boolean => {
  return !!QRCode;
};

export const buildQRContent = (
  qrType: QRType,
  qrContent: string,
  emailData: EmailData,
  phoneData: PhoneData,
  wifiData: WifiData,
  vcardData: VCardData
): string => {
  console.log('Building QR content for type:', qrType, 'content:', qrContent);
  
  switch (qrType) {
    case 'url':
      return qrContent.startsWith('http') ? qrContent : `https://${qrContent}`;
    
    case 'text':
      return qrContent;
    
    case 'email':
      return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    
    case 'phone':
      const cleanNumber = phoneData.number.replace(/\D/g, '');
      return phoneData.message 
        ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(phoneData.message)}`
        : `tel:${cleanNumber}`;
    
    case 'wifi':
      return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
    
    case 'vcard':
      return `BEGIN:VCARD
VERSION:3.0
FN:${vcardData.name}
ORG:${vcardData.organization}
TEL:${vcardData.phone}
EMAIL:${vcardData.email}
URL:${vcardData.website}
END:VCARD`;
    
    default:
      return qrContent;
  }
};

export const generateQRCode = async (content: string, canvas: HTMLCanvasElement): Promise<void> => {
  console.log('Generating QR Code with content:', content);
  console.log('QRCode library available:', !!QRCode);
  console.log('Canvas element:', canvas);
  console.log('Canvas width:', canvas.width, 'height:', canvas.height);
  
  if (!QRCode) {
    console.error('QRCode library not available');
    throw new Error('QRCode library não disponível');
  }

  if (!content || content.trim() === '') {
    console.error('Content is empty');
    throw new Error('Conteúdo não pode estar vazio');
  }

  if (!canvas) {
    console.error('Canvas element is null or undefined');
    throw new Error('Canvas não está disponível');
  }

  // Verificar se o canvas tem contexto de desenho
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Canvas context not available');
    throw new Error('Contexto do canvas não disponível');
  }

  try {
    // Definir dimensões do canvas antes da geração
    canvas.width = 300;
    canvas.height = 300;
    
    await QRCode.toCanvas(canvas, content, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    console.log('QR Code generated successfully');
  } catch (error) {
    console.error('Error generating QR Code:', error);
    throw error;
  }
};
