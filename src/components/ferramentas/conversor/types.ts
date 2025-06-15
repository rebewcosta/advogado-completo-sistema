
export type ConversionType = 
  | 'txt-to-pdf' 
  | 'html-to-pdf' 
  | 'pdf-merge' 
  | 'pdf-split'
  | 'word-to-pdf'
  | 'pdf-to-word'
  | 'pdf-to-jpg'
  | 'jpg-to-pdf';

export interface ConversionOption {
  value: ConversionType;
  label: string;
  accepts: string;
  multiple: boolean;
}
