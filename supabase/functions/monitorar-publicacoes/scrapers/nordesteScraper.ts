
import { BaseScraper } from './baseScraper.ts';
import { PublicacaoEncontrada } from './types.ts';

export class NordesteScraper extends BaseScraper {
  async buscarPublicacoesCE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Ceará...');
      
      const url = 'https://www.doe.seplag.ce.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'CE', 'do Ceará', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do CE:', error);
    }
    
    return [];
  }

  async buscarPublicacoesBA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial da Bahia...');
      
      const url = 'http://www.egba.ba.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'BA', 'da Bahia', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário da BA:', error);
    }
    
    return [];
  }

  async buscarPublicacoesPE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Pernambuco...');
      
      const url = 'https://www.cepe.com.br/diario-oficial';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'PE', 'de Pernambuco', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de PE:', error);
    }
    
    return [];
  }

  async buscarPublicacoesMA(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Maranhão...');
      
      const url = 'http://www.diariooficial.ma.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'MA', 'do Maranhão', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do MA:', error);
    }
    
    return [];
  }

  async buscarPublicacoesPI(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Piauí...');
      
      const url = 'http://www.diariooficial.pi.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'PI', 'do Piauí', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do PI:', error);
    }
    
    return [];
  }

  async buscarPublicacoesAL(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Alagoas...');
      
      const url = 'http://www.imprensaoficialalagoas.com.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'AL', 'de Alagoas', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de AL:', error);
    }
    
    return [];
  }

  async buscarPublicacoesSE(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial de Sergipe...');
      
      const url = 'https://doe.se.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'SE', 'de Sergipe', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário de SE:', error);
    }
    
    return [];
  }

  async buscarPublicacoesPB(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial da Paraíba...');
      
      const url = 'http://www.paraiba.pb.gov.br/diariooficial/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'PB', 'da Paraíba', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário da PB:', error);
    }
    
    return [];
  }

  async buscarPublicacoesRN(nomes: string[]): Promise<PublicacaoEncontrada[]> {
    try {
      console.log('🔍 Buscando no Diário Oficial do Rio Grande do Norte...');
      
      const url = 'http://diariooficial.rn.gov.br/';
      const response = await this.fetchWithTimeout(url);

      if (response.ok) {
        const html = await response.text();
        return this.buscarNomesNoHtml(html, nomes, 'RN', 'do Rio Grande do Norte', url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar no Diário do RN:', error);
    }
    
    return [];
  }
}
