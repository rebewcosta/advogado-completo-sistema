
export const savePublicacoes = async (publicacoes: any[], userId: string, supabase: any) => {
  if (publicacoes.length === 0) return;

  const publicacoesParaSalvar = publicacoes.map(pub => ({
    ...pub,
    user_id: userId,
    segredo_justica: false,
    lida: false,
    importante: false
  }));

  const { error: insertError } = await supabase
    .from('publicacoes_diario_oficial')
    .insert(publicacoesParaSalvar);

  if (insertError) {
    console.error('❌ Erro ao salvar publicações:', insertError);
    throw new Error('Erro ao salvar algumas publicações no banco de dados');
  } else {
    console.log('✅ Publicações salvas no banco de dados');
  }
};

export const getFontesConsultadas = (estados: string[]) => {
  // Lista completa de estados brasileiros
  const todosEstados = ['SP', 'RJ', 'MG', 'CE', 'PR', 'RS', 'SC', 'BA', 'GO', 'PE', 'ES', 'DF', 'MT', 'MS', 'PA', 'AM', 'RO', 'AC', 'RR', 'AP', 'TO', 'MA', 'PI', 'AL', 'SE', 'PB', 'RN'];
  
  const estadosConsultados = estados.length > 0 ? estados : todosEstados.slice(0, 10); // Primeiros 10 estados principais
  const fontes: string[] = [];
  
  estadosConsultados.forEach(estado => {
    fontes.push(`Diário Oficial ${estado}`);
    fontes.push(`Diário da Justiça ${estado}`);
  });

  return fontes;
};
