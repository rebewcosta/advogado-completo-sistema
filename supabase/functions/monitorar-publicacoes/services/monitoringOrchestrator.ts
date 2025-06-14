
import { TribunalApiService } from './tribunalApiService.ts';
import { CNJApiService } from './cnjApiService.ts';
import { JusbrassilService } from './jusbrasil.ts';
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
  private tribunalApiService = new TribunalApiService();
  private cnjApiService = new CNJApiService();
  private jusbrassilService = new JusbrassilService();

  async executarBuscaCompleta(
    nomes: string[], 
    estados: string[], 
    userId: string, 
    supabase: any
  ): Promise<{ publicacoes: number; fontes: string[] }> {
    console.log('🚀 INICIANDO BUSCA OFICIAL NACIONAL COM APIs DE TODOS OS TRIBUNAIS DO BRASIL...');
    console.log('📋 Nomes válidos:', nomes);
    console.log('🌍 Estados válidos:', estados.length > 0 ? estados : 'TODOS OS 26 ESTADOS + DF (Cobertura Nacional)');
    
    const todasPublicacoes: PublicacaoEncontrada[] = [];
    const fontesConsultadas = ['CNJ API', 'APIs Tribunais Nacionais (27 Tribunais)', 'Jusbrasil'];

    try {
      // 1. Buscar na API oficial do CNJ (prioritária)
      console.log('⚖️ Consultando API oficial do CNJ...');
      const publicacoesCNJ = await this.cnjApiService.buscarPublicacoesCNJ(nomes, estados);
      todasPublicacoes.push(...publicacoesCNJ);
      
      // 2. Buscar nas APIs oficiais de TODOS os tribunais estaduais do Brasil
      console.log('🏛️ Consultando APIs oficiais de TODOS os 27 Tribunais do Brasil (26 estados + DF)...');
      const publicacoesTribunais = await this.tribunalApiService.buscarPublicacoes(nomes, estados);
      todasPublicacoes.push(...publicacoesTribunais);
      
      // 3. Complementar com Jusbrasil (fonte adicional)
      console.log('📚 Consultando Jusbrasil como fonte complementar...');
      const publicacoesJusbrasil = await this.jusbrassilService.buscarPublicacoes(nomes, estados);
      todasPublicacoes.push(...publicacoesJusbrasil);

      console.log(`📄 Total de publicações coletadas em TODO O BRASIL: ${todasPublicacoes.length}`);

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
      console.error('❌ Erro durante busca oficial nacional:', searchError);
      throw searchError;
    }
  }
}
