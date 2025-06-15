
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy } from 'lucide-react';

interface QRDisplayProps {
  generatedQR: string | null;
  qrTitle: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onDownload: () => void;
  onCopyImage: () => void;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
  generatedQR,
  qrTitle,
  canvasRef,
  onDownload,
  onCopyImage,
}) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      {/* Canvas sempre visível mas pequeno para não afetar o layout */}
      <canvas 
        ref={canvasRef}
        style={{ 
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden'
        }}
      />
      
      {generatedQR ? (
        <div className="space-y-4">
          <img 
            src={generatedQR} 
            alt="QR Code gerado" 
            className="mx-auto max-w-full h-auto border rounded"
          />
          {qrTitle && (
            <p className="font-medium text-gray-900">{qrTitle}</p>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button onClick={onCopyImage} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">
          <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Seu QR Code aparecerá aqui</p>
        </div>
      )}
    </div>
  );
};
