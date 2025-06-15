
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, Copy, Link2, Mail, Phone, Wifi } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

interface QRData {
  type: QRType;
  content: string;
  title?: string;
}

export const GeradorQrCode: React.FC = () => {
  const { toast } = useToast();
  const [qrType, setQRType] = useState<QRType>('url');
  const [qrContent, setQRContent] = useState('');
  const [qrTitle, setQRTitle] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [phoneData, setPhoneData] = useState({ number: '', message: '' });
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', security: 'WPA' });
  const [vcardData, setVcardData] = useState({ 
    name: '', 
    organization: '', 
    phone: '', 
    email: '', 
    website: '' 
  });

  const qrTypes = [
    { value: 'url', label: 'Link/URL', icon: Link2 },
    { value: 'text', label: 'Texto Livre', icon: QrCode },
    { value: 'email', label: 'E-mail', icon: Mail },
    { value: 'phone', label: 'Telefone/WhatsApp', icon: Phone },
    { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { value: 'vcard', label: 'Cartão de Visita', icon: QrCode }
  ];

  // Simula geração de QR Code (normalmente usaria uma biblioteca como qrcode)
  const generateQRCodeDataURL = (content: string): string => {
    // Para demonstração, criamos um SVG simples
    const size = 200;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black" rx="5"/>
        <rect x="30" y="30" width="140" height="140" fill="white" rx="3"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
          QR CODE
        </text>
        <text x="${size/2}" y="${size/2 + 15}" text-anchor="middle" font-family="monospace" font-size="6" fill="black">
          ${content.length > 20 ? content.substring(0, 20) + '...' : content}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const buildContent = (): string => {
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

  const handleGenerate = () => {
    const content = buildContent();
    
    if (!content.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Por favor, preencha os campos necessários para gerar o QR Code.",
        variant: "destructive",
      });
      return;
    }

    const qrDataURL = generateQRCodeDataURL(content);
    setGeneratedQR(qrDataURL);
    
    toast({
      title: "QR Code gerado!",
      description: "Seu QR Code foi criado com sucesso.",
    });
  };

  const handleDownload = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR;
    link.download = `qrcode_${qrTitle || qrType}_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "QR Code está sendo baixado.",
    });
  };

  const handleCopyContent = () => {
    const content = buildContent();
    navigator.clipboard.writeText(content);
    
    toast({
      title: "Conteúdo copiado!",
      description: "O conteúdo do QR Code foi copiado para a área de transferência.",
    });
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Gerador de QR Code
        </CardTitle>
        <CardDescription>
          Crie QR Codes para documentos, links, contatos e informações importantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="qr-type">Tipo de QR Code</Label>
              <Select value={qrType} onValueChange={(value: QRType) => setQRType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qrTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="qr-title">Título (opcional)</Label>
              <Input
                id="qr-title"
                value={qrTitle}
                onChange={(e) => setQRTitle(e.target.value)}
                placeholder="Ex: Contato do Escritório"
                className="mt-1"
              />
            </div>

            {renderFormFields()}

            <div className="flex gap-2">
              <Button onClick={handleGenerate} className="flex-1">
                <QrCode className="h-4 w-4 mr-2" />
                Gerar QR Code
              </Button>
              <Button onClick={handleCopyContent} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {generatedQR ? (
                <div className="space-y-4">
                  <img 
                    src={generatedQR} 
                    alt="QR Code gerado" 
                    className="mx-auto max-w-full h-auto"
                  />
                  {qrTitle && (
                    <p className="font-medium text-gray-900">{qrTitle}</p>
                  )}
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar QR Code
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Seu QR Code aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Casos de Uso para Advogados:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Links para petições ou documentos online</li>
            <li>• Cartões de visita digitais</li>
            <li>• Acesso rápido ao WhatsApp do escritório</li>
            <li>• Wi-Fi para clientes na sala de espera</li>
            <li>• Links para formulários de contato</li>
            <li>• Acesso a portais do cliente</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
