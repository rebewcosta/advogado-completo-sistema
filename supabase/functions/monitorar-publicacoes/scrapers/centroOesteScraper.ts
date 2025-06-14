
import { BaseScraper } from './baseScraper.ts';
import { PublicacaoEncontrada } from './types.ts';

export class CentroOesteScraper extends BaseScraper {
  async buscarPublicacoesGO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Goiás...');
      
      const url = 'https://www.dio.go.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'GO', 'de Goiás', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de GO:', error);
    }
    
    return [];
  }

  async buscarPublicacoesDF(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Distrito Federal...');
      
      const url = 'http://www.buriti.df.gov.br/ftp/diariooficial/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'DF', 'do Distrito Federal', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do DF:', error);
    }
    
    return [];
  }

  async buscarPublicacoesMT(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Mato Grosso...');
      
      const url = 'https://www.iomat.mt.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'MT', 'de Mato Grosso', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MT:', error);
    }
    
    return [];
  }

  async buscarPublicacoesMS(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Mato Grosso do Sul...');
      
      const url = 'https://www.spdo.ms.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'MS', 'de Mato Grosso do Sul', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MS:', error);
    }
    
    return [];
  }
}
