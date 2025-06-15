import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRFormFields } from './qrcode/QRFormFields';
import { QRDisplay } from './qrcode/QRDisplay';
import { qrTypes } from './qrcode/qrTypes';
import { buildQRContent, generateQRCode, isQRCodeLibAvailable } from './qrcode/utils';
import { QRType, EmailData, PhoneData, WifiData, VCardData } from './qrcode/types';

export const GeradorQrCode: React.FC = () => {
  const { toast } = useToast();
  const [qrType, setQRType] = useState<QRType>('url');
  const [qrContent, setQRContent] = useState('');
  const [qrTitle, setQRTitle] = useState('');
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [emailData, setEmailData] = useState<EmailData>({ to: '', subject: '', body: '' });
  const [phoneData, setPhoneData] = useState<PhoneData>({ number: '', message: '' });
  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', password: '', security: 'WPA' });
  const [vcardData, setVcardData] = useState<VCardData>({ 
    name: '', 
    organization: '', 
    phone: '', 
    email: '', 
    website: '' 
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = async () => {
    console.log('HandleGenerate called');
    console.log('QR Type:', qrType);
    console.log('QR Content:', qrContent);
    console.log('Email Data:', emailData);
    console.log('Phone Data:', phoneData);
    console.log('WiFi Data:', wifiData);
    console.log('VCard Data:', vcardData);

    try {
      const content = buildQRContent(qrType, qrContent, emailData, phoneData, wifiData, vcardData);
      console.log('Built content:', content);
      
      if (!content.trim()) {
        console.log('Content is empty, showing error toast');
        toast({
          title: "Conteúdo obrigatório",
          description: "Por favor, preencha os campos necessários para gerar o QR Code.",
          variant: "destructive",
        });
        return;
      }

      if (!isQRCodeLibAvailable()) {
        console.log('QRCode library not available');
        toast({
          title: "Biblioteca não disponível",
          description: "A biblioteca QR Code não está carregada.",
          variant: "destructive",
        });
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        console.log('Canvas not available');
        toast({
          title: "Erro no canvas",
          description: "Canvas não disponível para gerar o QR Code.",
          variant: "destructive",
        });
        return;
      }

      console.log('Starting QR Code generation...');
      await generateQRCode(content, canvas);

      const dataURL = canvas.toDataURL('image/png');
      console.log('Generated QR Code data URL length:', dataURL.length);
      setGeneratedQR(dataURL);
      
      toast({
        title: "QR Code gerado!",
        description: "Seu QR Code foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedQR) return;
    
    const link = document.createElement('a');
    link.href = generatedQR;
    link.download = `qrcode_${qrTitle || qrType}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "QR Code está sendo baixado.",
    });
  };

  const handleCopyContent = async () => {
    const content = buildQRContent(qrType, qrContent, emailData, phoneData, wifiData, vcardData);
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Conteúdo copiado!",
        description: "O conteúdo do QR Code foi copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleCopyImage = async () => {
    if (!generatedQR) return;
    
    try {
      const response = await fetch(generatedQR);
      const blob = await response.blob();
      
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        
        toast({
          title: "QR Code copiado!",
          description: "A imagem do QR Code foi copiada para a área de transferência.",
        });
      } else {
        // Fallback para navegadores que não suportam clipboard API para imagens
        const link = document.createElement('a');
        link.href = generatedQR;
        link.download = `qrcode_${qrTitle || qrType}_${Date.now()}.png`;
        link.click();
      }
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a imagem. Tente fazer o download.",
        variant: "destructive",
      });
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

            <QRFormFields
              qrType={qrType}
              qrContent={qrContent}
              setQRContent={setQRContent}
              emailData={emailData}
              setEmailData={setEmailData}
              phoneData={phoneData}
              setPhoneData={setPhoneData}
              wifiData={wifiData}
              setWifiData={setWifiData}
              vcardData={vcardData}
              setVcardData={setVcardData}
            />

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
            <QRDisplay
              generatedQR={generatedQR}
              qrTitle={qrTitle}
              canvasRef={canvasRef}
              onDownload={handleDownload}
              onCopyImage={handleCopyImage}
            />
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
