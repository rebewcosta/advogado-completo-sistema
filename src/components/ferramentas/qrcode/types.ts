
export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  number: string;
  message: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  security: string;
}

export interface VCardData {
  name: string;
  organization: string;
  phone: string;
  email: string;
  website: string;
}

export interface QRTypeOption {
  value: QRType;
  label: string;
  icon: any;
}
