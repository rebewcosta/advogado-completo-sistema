
export type ConversionType = 'txt-to-pdf' | 'html-to-pdf' | 'pdf-merge' | 'pdf-split';

export interface ConversionOption {
  value: ConversionType;
  label: string;
  accepts: string;
  multiple: boolean;
}
