
import { BaseScraper } from './baseScraper.ts';
import { PublicacaoEncontrada } from './types.ts';

export class SudesteScraper extends BaseScraper {
  async buscarPublicacoesSP(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de São Paulo...');
      
      const url = 'https://www.imprensaoficial.com.br/DO/BuscaDO2001Resultado_11_3.aspx';
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.buscarNomesNoHtml(html, nomes, 'SP', 'de São Paulo', url);
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SP:', error);
      return [];
    }
  }

  async buscarPublicacoesRJ(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio de Janeiro...');
      
      const url = 'http://www.ioerj.com.br/portal/modules/conteudoonline/mostra_edicao.php';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'RJ', 'do Rio de Janeiro', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RJ:', error);
    }
    
    return [];
  }

  async buscarPublicacoesMG(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Minas Gerais...');
      
      const url = 'https://www.jornalminasgerais.mg.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'MG', 'de Minas Gerais', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de MG:', error);
    }
    
    return [];
  }

  async buscarPublicacoesES(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Espírito Santo...');
      
      const url = 'https://www.dio.es.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'ES', 'do Espírito Santo', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de ES:', error);
    }
    
    return [];
  }
}
