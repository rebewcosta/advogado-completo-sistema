
import { PublicacaoEncontrada } from './types.ts';
import { SudesteScraper } from './sudesteScraper.ts';
import { SulScraper } from './sulScraper.ts';
import { NordesteScraper } from './nordesteScraper.ts';
import { CentroOesteScraper } from './centroOesteScraper.ts';
import { NorteScraper } from './norteScraper.ts';

export { PublicacaoEncontrada } from './types.ts';

export class DiarioScraper {
  private sudesteScraper = new SudesteScraper();
  private sulScraper = new SulScraper();
  private nordesteScraper = new NordesteScraper();
  private centroOesteScraper = new CentroOesteScraper();
  private norteScraper = new NorteScraper();

  async buscarEmTodosEstados(nomes: string[], estadosFiltro: string[] = []): Promise<PublicacaoEncontrada[]> {
    const todasPublicacoes: PublicacaoEncontrada[] = [];
    
    const scrapers = [
      // Sudeste
      { estado: 'SP', scraper: () => this.sudesteScraper.buscarPublicacoesSP(nomes) },
      { estado: 'RJ', scraper: () => this.sudesteScraper.buscarPublicacoesRJ(nomes) },
      { estado: 'MG', scraper: () => this.sudesteScraper.buscarPublicacoesMG(nomes) },
      { estado: 'ES', scraper: () => this.sudesteScraper.buscarPublicacoesES(nomes) },
      
      // Sul
      { estado: 'RS', scraper: () => this.sulScraper.buscarPublicacoesRS(nomes) },
      { estado: 'PR', scraper: () => this.sulScraper.buscarPublicacoesPR(nomes) },
      { estado: 'SC', scraper: () => this.sulScraper.buscarPublicacoesSC(nomes) },
      
      // Nordeste
      { estado: 'CE', scraper: () => this.nordesteScraper.buscarPublicacoesCE(nomes) },
      { estado: 'BA', scraper: () => this.nordesteScraper.buscarPublicacoesBA(nomes) },
      { estado: 'PE', scraper: () => this.nordesteScraper.buscarPublicacoesPE(nomes) },
      { estado: 'MA', scraper: () => this.nordesteScraper.buscarPublicacoesMA(nomes) },
      { estado: 'PI', scraper: () => this.nordesteScraper.buscarPublicacoesPI(nomes) },
      { estado: 'AL', scraper: () => this.nordesteScraper.buscarPublicacoesAL(nomes) },
      { estado: 'SE', scraper: () => this.nordesteScraper.buscarPublicacoesSE(nomes) },
      { estado: 'PB', scraper: () => this.nordesteScraper.buscarPublicacoesPB(nomes) },
      { estado: 'RN', scraper: () => this.nordesteScraper.buscarPublicacoesRN(nomes) },
      
      // Centro-Oeste
      { estado: 'GO', scraper: () => this.centroOesteScraper.buscarPublicacoesGO(nomes) },
      { estado: 'DF', scraper: () => this.centroOesteScraper.buscarPublicacoesDF(nomes) },
      { estado: 'MT', scraper: () => this.centroOesteScraper.buscarPublicacoesMT(nomes) },
      { estado: 'MS', scraper: () => this.centroOesteScraper.buscarPublicacoesMS(nomes) },
      
      // Norte
      { estado: 'PA', scraper: () => this.norteScraper.buscarPublicacoesPA(nomes) },
      { estado: 'AM', scraper: () => this.norteScraper.buscarPublicacoesAM(nomes) },
      { estado: 'RO', scraper: () => this.norteScraper.buscarPublicacoesRO(nomes) },
      { estado: 'AC', scraper: () => this.norteScraper.buscarPublicacoesAC(nomes) },
      { estado: 'RR', scraper: () => this.norteScraper.buscarPublicacoesRR(nomes) },
      { estado: 'AP', scraper: () => this.norteScraper.buscarPublicacoesAP(nomes) },
      { estado: 'TO', scraper: () => this.norteScraper.buscarPublicacoesTO(nomes) }
    ];

    // Filtrar por estados se especificado, senão busca em todos os 27 estados
    const scrapersParaExecutar = estadosFiltro.length > 0 
      ? scrapers.filter(s => estadosFiltro.includes(s.estado))
      : scrapers;

    console.log(`🌍 🇧🇷 EXECUTANDO BUSCA NACIONAL EM ${scrapersParaExecutar.length} ESTADOS: ${scrapersParaExecutar.map(s => s.estado).join(', ')}`);

    // Executar scrapers em paralelo com limite de concorrência
    const promises = scrapersParaExecutar.map(async ({ estado, scraper }) => {
      try {
        console.log(`🔄 Iniciando busca no estado: ${estado}`);
        const resultado = await scraper();
        console.log(`✅ Estado ${estado}: ${resultado.length} publicações encontradas`);
        return resultado;
      } catch (error) {
        console.error(`❌ Erro no scraper do estado ${estado}:`, error);
        return [];
      }
    });

    const resultados = await Promise.allSettled(promises);
    
    resultados.forEach((resultado, index) => {
      const estado = scrapersParaExecutar[index].estado;
      if (resultado.status === 'fulfilled') {
        todasPublicacoes.push(...resultado.value);
        console.log(`📊 Estado ${estado}: ${resultado.value.length} publicações adicionadas`);
      } else {
        console.error(`💥 Falha total no estado ${estado}:`, resultado.reason);
      }
    });

    console.log(`🎯 🇧🇷 TOTAL DE PUBLICAÇÕES ENCONTRADAS EM TODO O BRASIL: ${todasPublicacoes.length}`);
    return todasPublicacoes;
  }
}
