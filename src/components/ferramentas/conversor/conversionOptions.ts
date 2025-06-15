
import { ConversionOption } from './types';

export const conversionOptions: ConversionOption[] = [
  { value: 'txt-to-pdf', label: 'Texto para PDF', accepts: '.txt', multiple: false },
  { value: 'html-to-pdf', label: 'HTML para PDF', accepts: '.html,.htm', multiple: false },
  { value: 'pdf-merge', label: 'Unir PDFs', accepts: '.pdf', multiple: true },
  { value: 'pdf-split', label: 'Dividir PDF', accepts: '.pdf', multiple: false }
];
