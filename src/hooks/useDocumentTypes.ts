
import * as DocumentosService from '@/services/documentos';

// Re-exportar constantes
export const LIMITE_ARMAZENAMENTO_MB = DocumentosService.LIMITE_ARMAZENAMENTO_MB;
export const LIMITE_ARMAZENAMENTO_BYTES = DocumentosService.LIMITE_ARMAZENAMENTO_BYTES;

// Tipos para documentos
export type DocumentType = 'contrato' | 'petição' | 'procuração' | 'decisão' | 'outro';

export interface Document {
  id: string;
  nome: string;
  tipo: DocumentType;
  cliente: string;
  processo?: string;
  created_at: string;
  tamanho_bytes: number;
  path: string;
  content_type: string;
}
