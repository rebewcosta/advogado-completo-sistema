
import { QRType, EmailData, PhoneData, WifiData, VCardData } from './types';

// Importação condicional para evitar erros de build
let QRCodeLib: any;
try {
  QRCodeLib = require('qrcode');
} catch (error) {
  console.warn('QRCode library não disponível:', error);
}

export const isQRCodeLibAvailable = (): boolean => {
  return !!QRCodeLib;
};

export const buildQRContent = (
  qrType: QRType,
  qrContent: string,
  emailData: EmailData,
  phoneData: PhoneData,
  wifiData: WifiData,
  vcardData: VCardData
): string => {
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
  if (!QRCodeLib) {
    throw new Error('QRCode library não disponível');
  }

  await QRCodeLib.toCanvas(canvas, content, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
};
