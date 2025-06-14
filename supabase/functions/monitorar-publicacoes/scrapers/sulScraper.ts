
import { BaseScraper } from './baseScraper.ts';
import { PublicacaoEncontrada } from './types.ts';

export class SulScraper extends BaseScraper {
  async buscarPublicacoesRS(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio Grande do Sul...');
      
      const url = 'https://www.corag.com.br/doe';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'RS', 'do Rio Grande do Sul', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RS:', error);
    }
    
    return [];
  }

  async buscarPublicacoesPR(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Paraná...');
      
      const url = 'https://www.aen.pr.gov.br/Diario';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'PR', 'do Paraná', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PR:', error);
    }
    
    return [];
  }

  async buscarPublicacoesSC(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Santa Catarina...');
      
      const url = 'https://doe.sea.sc.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'SC', 'de Santa Catarina', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SC:', error);
    }
    
    return [];
  }
}
