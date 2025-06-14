
import { BaseScraper } from './baseScraper.ts';
import { PublicacaoEncontrada } from './types.ts';

export class NorteScraper extends BaseScraper {
  async buscarPublicacoesPA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Pará...');
      
      const url = 'https://www.ioepa.com.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'PA', 'do Pará', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PA:', error);
    }
    
    return [];
  }

  async buscarPublicacoesAM(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Amazonas...');
      
      const url = 'http://www.imprensaoficial.am.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'AM', 'do Amazonas', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AM:', error);
    }
    
    return [];
  }

  async buscarPublicacoesRO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Rondônia...');
      
      const url = 'http://www.diof.ro.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'RO', 'de Rondônia', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de RO:', error);
    }
    
    return [];
  }

  async buscarPublicacoesAC(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Acre...');
      
      const url = 'http://www.diario.ac.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'AC', 'do Acre', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AC:', error);
    }
    
    return [];
  }

  async buscarPublicacoesRR(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Roraima...');
      
      const url = 'https://doe.rr.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'RR', 'de Roraima', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de RR:', error);
    }
    
    return [];
  }

  async buscarPublicacoesAP(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Amapá...');
      
      const url = 'https://www.diap.ap.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'AP', 'do Amapá', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do AP:', error);
    }
    
    return [];
  }

  async buscarPublicacoesTO(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Tocantins...');
      
      const url = 'https://diariooficial.to.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'TO', 'de Tocantins', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de TO:', error);
    }
    
    return [];
  }
}
