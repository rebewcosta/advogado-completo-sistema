
import { PublicacaoEncontrada } from '../scrapers/types.ts';

export class CNJApiService {
  private readonly baseUrl = 'https://www.cnj.jus.br/api';
  private readonly timeout = 30000;

  async buscarPublicacoesCNJ(nomes: string[], estados: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log('⚖️ Iniciando busca na API oficial do CNJ...');
    
    try {
      // API do CNJ para consulta unificada de publicações
      for (const nome of nomes) {
        const resultado = await this.consultarCNJPorNome(nome, estados);
        publicacoes.push(...resultado);
      }
      
    } catch (error) {
      console.error('❌ Erro na consulta CNJ:', error);
    }
    
    console.log(`✅ CNJ: ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private async consultarCNJPorNome(nome: string, estados: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      const params = new URLSearchParams({
        nome: nome.trim(),
        dataInicio: this.getDataInicio(),
        dataFim: this.getDataAtual(),
        estados: estados.join(',') || 'SP,RJ,MG,RS,PR',
        formato: 'json'
      });

      const url = `${this.baseUrl}/v1/diarios/publicacoes?${params.toString()}`;
      
      console.log(`🔍 CNJ: Buscando ${nome}...`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sistema-Monitoramento-CNJ/1.0',
          'Authorization': `Bearer ${Deno.env.get('CNJ_API_TOKEN') || 'demo'}`
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        console.log(`⚠️ CNJ: HTTP ${response.status} para ${nome}`);
        return publicacoes;
      }

      const data = await response.json();
      
      if (data.publicacoes && Array.isArray(data.publicacoes)) {
        for (const item of data.publicacoes) {
          try {
            publicacoes.push({
              nome_advogado: nome,
              titulo_publicacao: item.titulo || `Publicação CNJ ${item.tribunal}`,
              conteudo_publicacao: this.limparTexto(item.conteudo || ''),
              data_publicacao: this.formatarData(item.dataPublicacao),
              diario_oficial: `${item.diario} - ${item.tribunal}`,
              estado: item.estado || 'BR',
              comarca: item.comarca || undefined,
              numero_processo: item.numeroProcesso || undefined,
              tipo_publicacao: item.tipoPublicacao || 'DJe CNJ',
              url_publicacao: item.urlPublicacao || `https://www.cnj.jus.br/diarios/${item.id}`
            });
          } catch (error) {
            console.error('Erro ao processar item CNJ:', error);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Erro na busca CNJ para ${nome}:`, error);
    }
    
    return publicacoes;
  }

  private getDataInicio(): string {
    const data = new Date();
    data.setDate(data.getDate() - 7);
    return data.toISOString().split('T')[0];
  }

  private getDataAtual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatarData(dataStr: string): string {
    try {
      if (!dataStr) return new Date().toISOString().split('T')[0];
      
      const data = new Date(dataStr);
      return data.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '')
      .trim()
      .substring(0, 1500);
  }
}
