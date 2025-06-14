
import { PublicacaoEncontrada } from '../scrapers/types.ts';

export class JusbrassilService {
  private readonly baseUrl = 'https://www.jusbrasil.com.br/api/public';
  private readonly timeout = 20000;

  async buscarPublicacoes(nomes: string[], estados: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log('⚖️ Iniciando busca no Jusbrasil...');
    
    for (const nome of nomes) {
      try {
        const resultado = await this.buscarPorAdvogado(nome, estados);
        publicacoes.push(...resultado);
        
        // Delay entre buscas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Erro busca Jusbrasil para ${nome}:`, error);
      }
    }
    
    console.log(`✅ Jusbrasil: ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private async buscarPorAdvogado(nome: string, estados: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      const params = new URLSearchParams({
        q: nome,
        tipo: 'diario',
        ordem: 'data',
        limit: '20'
      });

      if (estados.length > 0) {
        params.append('estados', estados.join(','));
      }

      const url = `${this.baseUrl}/busca?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.jusbrasil.com.br/',
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        console.log(`⚠️ Jusbrasil: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.processarResultados(data, nome);
      
    } catch (error) {
      console.error(`❌ Erro na busca Jusbrasil:`, error);
      return [];
    }
  }

  private processarResultados(data: any, nome: string): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    if (!data || !data.results || !Array.isArray(data.results)) {
      return publicacoes;
    }

    for (const item of data.results) {
      try {
        if (item.tipo !== 'diario') continue;
        
        publicacoes.push({
          nome_advogado: nome,
          titulo_publicacao: item.titulo || 'Publicação Jusbrasil',
          conteudo_publicacao: this.limparTexto(item.conteudo || item.resumo || ''),
          data_publicacao: this.formatarData(item.data),
          diario_oficial: item.fonte || 'Diário Oficial',
          estado: this.extrairEstado(item.fonte || ''),
          comarca: item.comarca || undefined,
          numero_processo: this.extrairNumeroProcesso(item.conteudo || ''),
          tipo_publicacao: 'Jusbrasil',
          url_publicacao: item.url
        });
      } catch (error) {
        console.error('Erro ao processar item Jusbrasil:', error);
      }
    }
    
    return publicacoes;
  }

  private extrairEstado(fonte: string): string {
    const estados = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'CE', 'GO', 'PE'];
    for (const estado of estados) {
      if (fonte.toUpperCase().includes(estado)) {
        return estado;
      }
    }
    return 'BR';
  }

  private extrairNumeroProcesso(conteudo: string): string | undefined {
    const regex = /\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}/g;
    const match = conteudo.match(regex);
    return match ? match[0] : undefined;
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
