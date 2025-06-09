
// Utilitários para o serviço de documentos

// Constantes de armazenamento
export const LIMITE_ARMAZENAMENTO_MB = 3;
export const LIMITE_ARMAZENAMENTO_BYTES = LIMITE_ARMAZENAMENTO_MB * 1024 * 1024; // 3MB em bytes

// Função para formatar tamanho em bytes para formato legível
export const formatarTamanhoArquivo = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Função para tratar erros de forma consistente
export const handleError = (error: any, defaultMessage: string): Error => {
  console.error(defaultMessage, error);
  
  if (error instanceof Error) return error;
  
  if (typeof error === 'object' && error !== null) {
    return new Error(
      error.message || error.error_description || error.error || JSON.stringify(error)
    );
  }
  
  return new Error(String(error || defaultMessage));
};
