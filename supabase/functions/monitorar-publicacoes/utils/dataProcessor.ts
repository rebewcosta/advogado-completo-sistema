
interface PublicacaoEncontrada {
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
}

export const removerDuplicatas = (publicacoes: PublicacaoEncontrada[]): PublicacaoEncontrada[] => {
  const vistas = new Set<string>();
  const unicas: PublicacaoEncontrada[] = [];
  
  for (const pub of publicacoes) {
    const chave = `${pub.nome_advogado}-${pub.estado}-${pub.conteudo_publicacao.substring(0, 200)}`;
    
    if (!vistas.has(chave)) {
      vistas.add(chave);
      unicas.push(pub);
    }
  }
  
  return unicas;
};

export const salvarPublicacoes = async (publicacoes: PublicacaoEncontrada[], userId: string, supabase: any) => {
  if (publicacoes.length === 0) return;

  const publicacoesParaSalvar = publicacoes.map(pub => ({
    ...pub,
    user_id: userId,
    segredo_justica: false,
    lida: false,
    importante: false
  }));

  console.log('💾 Salvando publicações no banco...');
  const { error: saveError } = await supabase
    .from('publicacoes_diario_oficial')
    .insert(publicacoesParaSalvar);

  if (saveError) {
    console.error('❌ Erro ao salvar publicações:', saveError);
    throw saveError;
  } else {
    console.log(`✅ ${publicacoes.length} publicações salvas com sucesso`);
  }
};
