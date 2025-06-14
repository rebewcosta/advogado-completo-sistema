
export const createMonitoringLog = async (userId: string, supabase: any) => {
  const { data: logEntry, error: logError } = await supabase
    .from('logs_monitoramento')
    .insert({
      user_id: userId,
      status: 'iniciado',
      data_execucao: new Date().toISOString()
    })
    .select()
    .single();

  if (logError) {
    console.error('❌ Erro ao criar log:', logError);
    throw new Error('Failed to create monitoring log');
  }

  return logEntry;
};

export const updateMonitoringLog = async (
  logId: string, 
  publicacoesEncontradas: number, 
  tempoExecucao: number, 
  fontesConsultadas: string[], 
  erros: string[], 
  supabase: any
) => {
  const { error: updateError } = await supabase
    .from('logs_monitoramento')
    .update({
      status: 'concluido',
      publicacoes_encontradas: publicacoesEncontradas,
      tempo_execucao_segundos: tempoExecucao,
      fontes_consultadas: fontesConsultadas,
      erros: erros.length > 0 ? erros.join('; ') : null
    })
    .eq('id', logId);

  if (updateError) {
    console.error('❌ Erro ao atualizar log:', updateError);
  }
};
