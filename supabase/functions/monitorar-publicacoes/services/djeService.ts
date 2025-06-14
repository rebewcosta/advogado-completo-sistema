
import { PublicacaoEncontrada } from '../scrapers/types.ts';

export class DJeService {
  private readonly baseUrl = 'https://www.cnj.jus.br/dje-api';
  private readonly timeout = 30000; // 30 segundos

  async buscarPublicacoesDJe(nomes: string[], estados: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log('🏛️ Iniciando busca no DJe (Diário da Justiça Eletrônico)...');
    
    const estadosParaBuscar = estados.length > 0 ? estados : ['SP', 'RJ', 'MG', 'RS', 'PR'];
    
    for (const estado of estadosParaBuscar) {
      try {
        console.log(`🔍 Buscando no DJe ${estado}...`);
        
        for (const nome of nomes) {
          const result = await this.buscarPorNome(nome, estado);
          publicacoes.push(...result);
        }
        
        // Delay entre estados para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Erro na busca DJe ${estado}:`, error);
      }
    }
    
    console.log(`✅ DJe: ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private async buscarPorNome(nome: string, estado: string): Promise<PublicacaoEncontrada[]> {
    try {
      // Construir URL de busca do DJe
      const params = new URLSearchParams({
        nome: nome.trim(),
        estado: estado,
        dataInicio: this.getDataInicio(),
        dataFim: this.getDataAtual(),
        formato: 'json'
      });

      const url = `${this.baseUrl}/publicacoes?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.cnj.jus.br/',
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        console.log(`⚠️ DJe ${estado}: HTTP ${response.status}`);
        return [];
      }

      const data = await response.json();
      return this.processarResultadosDJe(data, nome, estado);
      
    } catch (error) {
      console.error(`❌ Erro busca DJe ${estado} para ${nome}:`, error);
      return [];
    }
  }

  private processarResultadosDJe(data: any, nome: string, estado: string): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    if (!data || !data.publicacoes || !Array.isArray(data.publicacoes)) {
      return publicacoes;
    }

    for (const item of data.publicacoes) {
      try {
        publicacoes.push({
          nome_advogado: nome,
          titulo_publicacao: item.titulo || `Publicação DJe ${estado}`,
          conteudo_publicacao: this.limparTexto(item.conteudo || item.texto || ''),
          data_publicacao: this.formatarData(item.dataPublicacao),
          diario_oficial: `Diário da Justiça Eletrônico ${estado}`,
          estado: estado,
          comarca: item.comarca || undefined,
          numero_processo: item.numeroProcesso || undefined,
          tipo_publicacao: item.tipoPublicacao || 'DJe',
          url_publicacao: item.url || `https://dje.tjsp.jus.br/cdje/index.do?cdVolume=${item.volume}`
        });
      } catch (error) {
        console.error('Erro ao processar item DJe:', error);
      }
    }
    
    return publicacoes;
  }

  private getDataInicio(): string {
    const data = new Date();
    data.setDate(data.getDate() - 7); // 7 dias atrás
    return data.toISOString().split('T')[0];
  }

  private getDataAtual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatarData(dataStr: string): string {
    try {
      if (!dataStr) return new Date().toISOString().split('T')[0];
      
      // Tentar diferentes formatos de data
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
