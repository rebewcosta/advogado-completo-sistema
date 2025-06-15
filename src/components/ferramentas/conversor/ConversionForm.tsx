
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { ConversionType } from './types';
import { conversionOptions } from './conversionOptions';

interface ConversionFormProps {
  conversionType: ConversionType;
  setConversionType: (type: ConversionType) => void;
  textContent: string;
  setTextContent: (content: string) => void;
  selectedFiles: FileList | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConvert: () => void;
  isConverting: boolean;
}

export const ConversionForm: React.FC<ConversionFormProps> = ({
  conversionType,
  setConversionType,
  textContent,
  setTextContent,
  selectedFiles,
  onFileSelect,
  onConvert,
  isConverting,
}) => {
  const selectedOption = conversionOptions.find(opt => opt.value === conversionType);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="conversion-type">Tipo de Conversão</Label>
        <Select value={conversionType} onValueChange={(value: ConversionType) => setConversionType(value)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione o tipo de conversão" />
          </SelectTrigger>
          <SelectContent>
            {conversionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {conversionType === 'txt-to-pdf' && (
        <div>
          <Label htmlFor="text-content">Texto para converter (ou selecione arquivo .txt)</Label>
          <textarea
            id="text-content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Digite seu texto aqui ou selecione um arquivo .txt abaixo..."
            className="mt-1 w-full min-h-[150px] p-3 border border-input rounded-md resize-vertical"
          />
        </div>
      )}

      <div>
        <Label htmlFor="file-upload">
          {selectedOption?.multiple ? 'Arquivos' : 'Arquivo'} para Conversão
        </Label>
        <Input
          id="file-upload"
          type="file"
          onChange={onFileSelect}
          accept={selectedOption?.accepts}
          multiple={selectedOption?.multiple}
          className="mt-1"
        />
        {selectedFiles && (
          <p className="text-sm text-gray-600 mt-1">
            {selectedFiles.length > 1 
              ? `${selectedFiles.length} arquivos selecionados`
              : `Arquivo selecionado: ${selectedFiles[0].name}`
            }
          </p>
        )}
      </div>

      <Button 
        onClick={onConvert} 
        disabled={(!selectedFiles && !textContent) || isConverting}
        className="w-full"
      >
        {isConverting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Convertendo...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Converter
          </>
        )}
      </Button>
    </div>
  );
};
