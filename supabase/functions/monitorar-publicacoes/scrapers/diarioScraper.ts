
import { PublicacaoEncontrada } from './types.ts';
import { SudesteScraper } from './sudesteScraper.ts';
import { SulScraper } from './sulScraper.ts';
import { CentroOesteScraper } from './centroOesteScraper.ts';
import { NordesteScraper } from './nordesteScraper.ts';
import { NorteScraper } from './norteScraper.ts';

export class DiarioScraper {
  private sudesteScraper = new SudesteScraper();
  private sulScraper = new SulScraper();
  private centroOesteScraper = new CentroOesteScraper();
  private nordesteScraper = new NordesteScraper();
  private norteScraper = new NorteScraper();

  async buscarEmTodosEstados(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    // Estados principais se nenhum específico for fornecido
    const estadosParaBuscar = estadosEspecificos.length > 0 
      ? estadosEspecificos 
      : ['SP', 'RJ', 'MG', 'CE', 'PR', 'RS', 'SC', 'BA', 'GO'];
    
    console.log(`🌐 Iniciando busca em ${estadosParaBuscar.length} estados: ${estadosParaBuscar.join(', ')}`);

    // Buscar em paralelo para melhor performance
    const promises: Promise<PublicacaoEncontrada[]>[] = [];

    // Região Sudeste
    if (estadosParaBuscar.includes('SP')) {
      promises.push(this.sudesteScraper.buscarPublicacoesSP(nomes));
    }
    if (estadosParaBuscar.includes('RJ')) {
      promises.push(this.sudesteScraper.buscarPublicacoesRJ(nomes));
    }
    if (estadosParaBuscar.includes('MG')) {
      promises.push(this.sudesteScraper.buscarPublicacoesMG(nomes));
    }
    if (estadosParaBuscar.includes('ES')) {
      promises.push(this.sudesteScraper.buscarPublicacoesES(nomes));
    }

    // Região Sul
    if (estadosParaBuscar.includes('RS')) {
      promises.push(this.sulScraper.buscarPublicacoesRS(nomes));
    }
    if (estadosParaBuscar.includes('PR')) {
      promises.push(this.sulScraper.buscarPublicacoesPR(nomes));
    }
    if (estadosParaBuscar.includes('SC')) {
      promises.push(this.sulScraper.buscarPublicacoesSC(nomes));
    }

    // Região Centro-Oeste
    if (estadosParaBuscar.includes('GO')) {
      promises.push(this.centroOesteScraper.buscarPublicacoesGO(nomes));
    }
    if (estadosParaBuscar.includes('DF')) {
      promises.push(this.centroOesteScraper.buscarPublicacoesDF(nomes));
    }
    if (estadosParaBuscar.includes('MT')) {
      promises.push(this.centroOesteScraper.buscarPublicacoesMT(nomes));
    }
    if (estadosParaBuscar.includes('MS')) {
      promises.push(this.centroOesteScraper.buscarPublicacoesMS(nomes));
    }

    // Região Nordeste
    if (estadosParaBuscar.includes('BA')) {
      promises.push(this.nordesteScraper.buscarPublicacoesBA(nomes));
    }
    if (estadosParaBuscar.includes('CE')) {
      promises.push(this.nordesteScraper.buscarPublicacoesCE(nomes));
    }
    if (estadosParaBuscar.includes('PE')) {
      promises.push(this.nordesteScraper.buscarPublicacoesPE(nomes));
    }
    if (estadosParaBuscar.includes('RN')) {
      promises.push(this.nordesteScraper.buscarPublicacoesRN(nomes));
    }
    if (estadosParaBuscar.includes('PB')) {
      promises.push(this.nordesteScraper.buscarPublicacoesPB(nomes));
    }
    if (estadosParaBuscar.includes('AL')) {
      promises.push(this.nordesteScraper.buscarPublicacoesAL(nomes));
    }
    if (estadosParaBuscar.includes('SE')) {
      promises.push(this.nordesteScraper.buscarPublicacoesSE(nomes));
    }
    if (estadosParaBuscar.includes('MA')) {
      promises.push(this.nordesteScraper.buscarPublicacoesMA(nomes));
    }
    if (estadosParaBuscar.includes('PI')) {
      promises.push(this.nordesteScraper.buscarPublicacoesPI(nomes));
    }

    // Região Norte
    if (estadosParaBuscar.includes('PA')) {
      promises.push(this.norteScraper.buscarPublicacoesPA(nomes));
    }
    if (estadosParaBuscar.includes('AM')) {
      promises.push(this.norteScraper.buscarPublicacoesAM(nomes));
    }
    if (estadosParaBuscar.includes('RO')) {
      promises.push(this.norteScraper.buscarPublicacoesRO(nomes));
    }
    if (estadosParaBuscar.includes('AC')) {
      promises.push(this.norteScraper.buscarPublicacoesAC(nomes));
    }
    if (estadosParaBuscar.includes('RR')) {
      promises.push(this.norteScraper.buscarPublicacoesRR(nomes));
    }
    if (estadosParaBuscar.includes('AP')) {
      promises.push(this.norteScraper.buscarPublicacoesAP(nomes));
    }
    if (estadosParaBuscar.includes('TO')) {
      promises.push(this.norteScraper.buscarPublicacoesTO(nomes));
    }

    try {
      const resultados = await Promise.allSettled(promises);
      
      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          publicacoes.push(...resultado.value);
        } else {
          console.error(`❌ Erro na busca ${index}:`, resultado.reason);
        }
      });

      console.log(`✅ Busca concluída: ${publicacoes.length} publicações encontradas`);
      return publicacoes;

    } catch (error) {
      console.error('❌ Erro geral na busca:', error);
      return publicacoes;
    }
  }
}

// Exportar também a interface para compatibilidade
export { PublicacaoEncontrada };
