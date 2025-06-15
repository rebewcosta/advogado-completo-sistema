
import { Link2, Mail, Phone, Wifi, QrCode } from 'lucide-react';
import { QRTypeOption } from './types';

export const qrTypes: QRTypeOption[] = [
  { value: 'url', label: 'Link/URL', icon: Link2 },
  { value: 'text', label: 'Texto Livre', icon: QrCode },
  { value: 'email', label: 'E-mail', icon: Mail },
  { value: 'phone', label: 'Telefone/WhatsApp', icon: Phone },
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'vcard', label: 'Cartão de Visita', icon: QrCode }
];
