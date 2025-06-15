
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRType, EmailData, PhoneData, WifiData, VCardData } from './types';

interface QRFormFieldsProps {
  qrType: QRType;
  qrContent: string;
  setQRContent: (content: string) => void;
  emailData: EmailData;
  setEmailData: (data: EmailData) => void;
  phoneData: PhoneData;
  setPhoneData: (data: PhoneData) => void;
  wifiData: WifiData;
  setWifiData: (data: WifiData) => void;
  vcardData: VCardData;
  setVcardData: (data: VCardData) => void;
}

export const QRFormFields: React.FC<QRFormFieldsProps> = ({
  qrType,
  qrContent,
  setQRContent,
  emailData,
  setEmailData,
  phoneData,
  setPhoneData,
  wifiData,
  setWifiData,
  vcardData,
  setVcardData,
}) => {
  const renderFormFields = () => {
    switch (qrType) {
      case 'url':
      case 'text':
        return (
          <div>
            <Label htmlFor="content">
              {qrType === 'url' ? 'URL/Link' : 'Texto'}
            </Label>
            <Input
              id="content"
              value={qrContent}
              onChange={(e) => setQRContent(e.target.value)}
              placeholder={qrType === 'url' ? 'https://exemplo.com' : 'Digite seu texto aqui...'}
              className="mt-1"
            />
          </div>
        );

      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-to">E-mail de Destino</Label>
              <Input
                id="email-to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="destinatario@exemplo.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Assunto</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto do e-mail"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-body">Mensagem</Label>
              <Textarea
                id="email-body"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Corpo do e-mail..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone-number">Número do Telefone</Label>
              <Input
                id="phone-number"
                value={phoneData.number}
                onChange={(e) => setPhoneData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="5511999999999"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone-message">Mensagem (WhatsApp)</Label>
              <Textarea
                id="phone-message"
                value={phoneData.message}
                onChange={(e) => setPhoneData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Mensagem pré-definida para WhatsApp (opcional)"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="wifi-ssid">Nome da Rede (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifiData.ssid}
                onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                placeholder="Nome da rede Wi-Fi"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Senha</Label>
              <Input
                id="wifi-password"
                type="password"
                value={wifiData.password}
                onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Senha da rede"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wifi-security">Tipo de Segurança</Label>
              <Select value={wifiData.security} onValueChange={(value) => setWifiData(prev => ({ ...prev, security: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">Sem senha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="vcard-name">Nome Completo</Label>
              <Input
                id="vcard-name"
                value={vcardData.name}
                onChange={(e) => setVcardData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="João Silva"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-organization">Escritório/Organização</Label>
              <Input
                id="vcard-organization"
                value={vcardData.organization}
                onChange={(e) => setVcardData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Silva & Associados Advocacia"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Telefone</Label>
              <Input
                id="vcard-phone"
                value={vcardData.phone}
                onChange={(e) => setVcardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">E-mail</Label>
              <Input
                id="vcard-email"
                type="email"
                value={vcardData.email}
                onChange={(e) => setVcardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="joao@silva-advocacia.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-website">Website</Label>
              <Input
                id="vcard-website"
                value={vcardData.website}
                onChange={(e) => setVcardData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://silva-advocacia.com"
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderFormFields()}</>;
};
