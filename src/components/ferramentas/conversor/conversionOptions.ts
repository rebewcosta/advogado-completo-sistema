
import { ConversionOption } from './types';

export const conversionOptions: ConversionOption[] = [
  { value: 'txt-to-pdf', label: 'Texto para PDF', accepts: '.txt', multiple: false },
  { value: 'html-to-pdf', label: 'HTML para PDF', accepts: '.html,.htm', multiple: false },
  { value: 'word-to-pdf', label: 'Word para PDF', accepts: '.doc,.docx', multiple: false },
  { value: 'pdf-to-word', label: 'PDF para Word', accepts: '.pdf', multiple: false },
  { value: 'pdf-to-jpg', label: 'PDF para JPG', accepts: '.pdf', multiple: false },
  { value: 'jpg-to-pdf', label: 'JPG para PDF', accepts: '.jpg,.jpeg,.png', multiple: true },
  { value: 'pdf-merge', label: 'Unir PDFs', accepts: '.pdf', multiple: true },
  { value: 'pdf-split', label: 'Dividir PDF', accepts: '.pdf', multiple: false }
];
