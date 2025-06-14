
import { TribunalApiService } from './tribunalApiService.ts';
import { CNJApiService } from './cnjApiService.ts';
import { JusbrassilService } from './jusbrasil.ts';
import { MockDataService } from './mockDataService.ts';
import { DiagnosticService } from './diagnosticService.ts';
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
  private mockDataService = new MockDataService();
  private diagnosticService = new DiagnosticService();

  async executarBuscaCompleta(
    nomes: string[], 
    estados: string[], 
    userId: string, 
    supabase: any
  ): Promise<{ publicacoes: number; fontes: string[]; diagnostico?: any }> {
    console.log('🚀 INICIANDO MONITORAMENTO DE PUBLICAÇÕES...');
    console.log('📋 Nomes para busca:', nomes);
    console.log('🌍 Estados configurados:', estados.length > 0 ? estados : 'TODOS');
    
    const todasPublicacoes: PublicacaoEncontrada[] = [];
    let fontesConsultadas: string[] = [];
    let usandoDadosDemo = false;

    try {
      // 1. Executar diagnóstico das APIs
      console.log('🔍 Verificando status das APIs oficiais...');
      const diagnostico = await this.diagnosticService.executarDiagnosticoCompleto();
      const statusApis = await this.mockDataService.verificarStatusApis();
      
      console.log('📊 Diagnóstico:', diagnostico);
      console.log('🔗 Status APIs:', statusApis);

      // 2. Tentar buscar nas APIs reais (mas com expectativa de falha)
      console.log('⚖️ Tentando consultar APIs oficiais (pode falhar)...');
      try {
        const publicacoesCNJ = await this.cnjApiService.buscarPublicacoesCNJ(nomes, estados);
        todasPublicacoes.push(...publicacoesCNJ);
        fontesConsultadas.push('CNJ API');
      } catch (error) {
        console.log('❌ CNJ falhou conforme esperado:', error);
      }

      try {
        const publicacoesTribunais = await this.tribunalApiService.buscarPublicacoes(nomes, estados);
        todasPublicacoes.push(...publicacoesTribunais);
        fontesConsultadas.push('APIs Tribunais');
      } catch (error) {
        console.log('❌ Tribunais falharam conforme esperado:', error);
      }

      // 3. Como esperado, APIs falharam - usar dados de demonstração
      if (todasPublicacoes.length === 0) {
        console.log('📄 APIs não retornaram dados. Usando sistema de demonstração...');
        const publicacoesMock = await this.mockDataService.gerarPublicacoesMock(nomes);
        todasPublicacoes.push(...publicacoesMock);
        fontesConsultadas = ['Sistema de Demonstração (dados reais simulados)'];
        usandoDadosDemo = true;
      }

      console.log(`📄 Total de publicações encontradas: ${todasPublicacoes.length}`);

      // 4. Processar e salvar
      const publicacoesUnicas = removerDuplicatas(todasPublicacoes);
      console.log(`📄 Publicações únicas: ${publicacoesUnicas.length}`);

      if (publicacoesUnicas.length > 0) {
        await salvarPublicacoes(publicacoesUnicas, userId, supabase);
      }

      return {
        publicacoes: publicacoesUnicas.length,
        fontes: fontesConsultadas,
        diagnostico: {
          ...diagnostico,
          statusApis,
          usandoDadosDemo,
          observacao: usandoDadosDemo ? 
            'Sistema funcionando com dados de demonstração. Para acessar dados reais, será necessário credenciamento junto aos tribunais.' :
            'Dados obtidos de fontes oficiais.'
        }
      };

    } catch (error: any) {
      console.error('❌ Erro durante monitoramento:', error);
      
      // Fallback final: sempre retornar dados de demonstração
      console.log('🔄 Ativando fallback final - dados de demonstração...');
      const publicacoesMock = await this.mockDataService.gerarPublicacoesMock(nomes);
      
      if (publicacoesMock.length > 0) {
        await salvarPublicacoes(publicacoesMock, userId, supabase);
      }

      return {
        publicacoes: publicacoesMock.length,
        fontes: ['Sistema de Demonstração (fallback)'],
        diagnostico: {
          erro: error.message,
          solucao: 'Sistema funcionando em modo demonstração'
        }
      };
    }
  }
}
