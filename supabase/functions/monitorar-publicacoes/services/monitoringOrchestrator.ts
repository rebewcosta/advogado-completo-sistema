
import { DJeService } from './djeService.ts';
import { JusbrassilService } from './jusbrasil.ts';
import { RealScraperService } from './realScraper.ts';
import { removerDuplicatas, salvarPublicacoes } from '../utils/dataProcessor.ts';

interface PublicacaoEncontrada {
  nome_advogado: string;
  titulo_publicacao: string;
  conteudo_publicacao: string;
  data_publicacao: string;
  diario_oficial: string;
  estado: string;
  comarca?: string;
  numero_processo?: string;
  tipo_publicacao?: string;
  url_publicacao?: string;
}

export class MonitoringOrchestrator {
  private djeService = new DJeService();
  private jusbrassilService = new JusbrassilService();
  private realScraperService = new RealScraperService();

  async executarBuscaCompleta(
    nomes: string[], 
    estados: string[], 
    userId: string, 
    supabase: any
  ): Promise<{ publicacoes: number; fontes: string[] }> {
    console.log('🚀 INICIANDO BUSCA REAL MULTI-FONTE...');
    console.log('📋 Nomes válidos:', nomes);
    console.log('🌍 Estados válidos:', estados.length > 0 ? estados : 'PRINCIPAIS ESTADOS');
    
    const todasPublicacoes: PublicacaoEncontrada[] = [];
    const fontesConsultadas = ['DJe', 'Jusbrasil', 'Sites Oficiais'];

    try {
      // 1. Buscar no DJe (Diário da Justiça Eletrônico)
      console.log('🏛️ Iniciando busca no DJe...');
      const publicacoesDJe = await this.djeService.buscarPublicacoesDJe(nomes, estados);
      todasPublicacoes.push(...publicacoesDJe);
      
      // 2. Buscar no Jusbrasil (fonte complementar)
      console.log('⚖️ Iniciando busca no Jusbrasil...');
      const publicacoesJusbrasil = await this.jusbrassilService.buscarPublicacoes(nomes, estados);
      todasPublicacoes.push(...publicacoesJusbrasil);
      
      // 3. Scraping real dos sites oficiais
      console.log('🌐 Iniciando scraping dos sites oficiais...');
      const publicacoesScraping = await this.realScraperService.buscarPublicacoes(nomes, estados);
      todasPublicacoes.push(...publicacoesScraping);

      console.log(`📄 Total de publicações encontradas: ${todasPublicacoes.length}`);

      // Remover duplicatas baseado no conteúdo
      const publicacoesUnicas = removerDuplicatas(todasPublicacoes);
      console.log(`📄 Publicações únicas após remoção de duplicatas: ${publicacoesUnicas.length}`);

      // Salvar no banco de dados
      if (publicacoesUnicas.length > 0) {
        await salvarPublicacoes(publicacoesUnicas, userId, supabase);
      }

      return {
        publicacoes: publicacoesUnicas.length,
        fontes: fontesConsultadas
      };

    } catch (searchError: any) {
      console.error('❌ Erro durante busca REAL:', searchError);
      throw searchError;
    }
  }
}
