
import { PublicacaoEncontrada } from '../scrapers/types.ts';

interface TribunalAPI {
  estado: string;
  nome: string;
  baseUrl: string;
  apiKey?: string;
  authRequired: boolean;
  endpoints: {
    publicacoes: string;
    auth?: string;
  };
}

export class TribunalApiService {
  private readonly apis: TribunalAPI[] = [
    {
      estado: 'SP',
      nome: 'TJ-SP',
      baseUrl: 'https://api.tjsp.jus.br',
      authRequired: true,
      endpoints: {
        publicacoes: '/v1/publicacoes/diario',
        auth: '/v1/auth/token'
      }
    },
    {
      estado: 'RJ',
      nome: 'TJ-RJ',
      baseUrl: 'https://www3.tjrj.jus.br/consultadje',
      authRequired: false,
      endpoints: {
        publicacoes: '/api/publicacoes'
      }
    },
    {
      estado: 'MG',
      nome: 'TJ-MG',
      baseUrl: 'https://www8.tjmg.jus.br',
      authRequired: false,
      endpoints: {
        publicacoes: '/portal/publicacoes/api/diario'
      }
    },
    {
      estado: 'RS',
      nome: 'TJ-RS',
      baseUrl: 'https://www.tjrs.jus.br',
      authRequired: false,
      endpoints: {
        publicacoes: '/site_php/consulta/diario_da_justica/api/publicacoes.php'
      }
    },
    {
      estado: 'PR',
      nome: 'TJ-PR',
      baseUrl: 'https://portal.tjpr.jus.br',
      authRequired: false,
      endpoints: {
        publicacoes: '/jurisprudencia/api/publicacoes'
      }
    }
  ];

  private tokens: Map<string, { token: string; expires: number }> = new Map();

  async buscarPublicacoes(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log('🏛️ Iniciando busca via APIs OFICIAIS dos Tribunais...');
    
    const apisParaBuscar = estadosEspecificos.length > 0 
      ? this.apis.filter(api => estadosEspecificos.includes(api.estado))
      : this.apis;

    for (const api of apisParaBuscar) {
      try {
        console.log(`🔍 Consultando API oficial do ${api.nome}...`);
        
        const resultados = await this.consultarApiTribunal(api, nomes);
        publicacoes.push(...resultados);
        
        console.log(`✅ ${api.nome}: ${resultados.length} publicações encontradas`);
        
        // Delay respeitoso entre chamadas para APIs oficiais
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro na API ${api.nome}:`, error);
      }
    }
    
    console.log(`✅ APIs Oficiais: Total de ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private async consultarApiTribunal(api: TribunalAPI, nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      // Obter token de autenticação se necessário
      let authHeaders: Record<string, string> = {};
      if (api.authRequired) {
        const token = await this.obterTokenAutenticacao(api);
        if (token) {
          authHeaders = { 'Authorization': `Bearer ${token}` };
        }
      }

      // Buscar por cada nome
      for (const nome of nomes) {
        const dadosEncontrados = await this.buscarPorNomeNaApi(api, nome, authHeaders);
        publicacoes.push(...dadosEncontrados);
      }
      
    } catch (error) {
      console.error(`Erro ao consultar ${api.nome}:`, error);
    }
    
    return publicacoes;
  }

  private async obterTokenAutenticacao(api: TribunalAPI): Promise<string | null> {
    const cached = this.tokens.get(api.estado);
    
    // Verificar se token ainda é válido
    if (cached && cached.expires > Date.now()) {
      return cached.token;
    }

    try {
      if (!api.endpoints.auth) return null;

      console.log(`🔐 Obtendo token de autenticação para ${api.nome}...`);
      
      const response = await fetch(`${api.baseUrl}${api.endpoints.auth}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Sistema-Monitoramento-Publicacoes/1.0'
        },
        body: JSON.stringify({
          // Credenciais específicas por tribunal - em produção usar secrets
          client_id: Deno.env.get(`${api.estado}_CLIENT_ID`) || 'demo',
          client_secret: Deno.env.get(`${api.estado}_CLIENT_SECRET`) || 'demo'
        })
      });

      if (!response.ok) {
        console.log(`⚠️ Falha na autenticação ${api.nome}: HTTP ${response.status}`);
        return null;
      }

      const data = await response.json();
      const token = data.access_token || data.token;
      
      if (token) {
        // Cachear token por 1 hora
        this.tokens.set(api.estado, {
          token,
          expires: Date.now() + (3600 * 1000)
        });
        
        console.log(`✅ Token obtido para ${api.nome}`);
        return token;
      }
      
    } catch (error) {
      console.error(`❌ Erro na autenticação ${api.nome}:`, error);
    }
    
    return null;
  }

  private async buscarPorNomeNaApi(
    api: TribunalAPI, 
    nome: string, 
    authHeaders: Record<string, string>
  ): Promise<PublicacaoEncontrada[]> {
    try {
      const params = new URLSearchParams({
        nome: nome.trim(),
        dataInicio: this.getDataInicio(),
        dataFim: this.getDataAtual(),
        formato: 'json'
      });

      const url = `${api.baseUrl}${api.endpoints.publicacoes}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Sistema-Monitoramento-Publicacoes/1.0',
          'Referer': api.baseUrl,
          ...authHeaders
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        console.log(`⚠️ ${api.nome}: HTTP ${response.status} para ${nome}`);
        return [];
      }

      const data = await response.json();
      return this.processarRespostaApi(data, nome, api);
      
    } catch (error) {
      console.error(`❌ Erro na busca ${api.nome} para ${nome}:`, error);
      return [];
    }
  }

  private processarRespostaApi(data: any, nome: string, api: TribunalAPI): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      // Diferentes estruturas de resposta por tribunal
      let items: any[] = [];
      
      if (data.publicacoes) items = data.publicacoes;
      else if (data.resultados) items = data.resultados;
      else if (data.dados) items = data.dados;
      else if (Array.isArray(data)) items = data;
      else if (data.items) items = data.items;
      
      for (const item of items) {
        publicacoes.push({
          nome_advogado: nome,
          titulo_publicacao: this.extrairTitulo(item, api),
          conteudo_publicacao: this.limparTexto(this.extrairConteudo(item)),
          data_publicacao: this.formatarData(this.extrairData(item)),
          diario_oficial: `Diário Oficial ${api.estado} - ${api.nome}`,
          estado: api.estado,
          comarca: item.comarca || item.orgao || undefined,
          numero_processo: this.extrairNumeroProcesso(item),
          tipo_publicacao: item.tipo || item.categoria || 'Publicação Oficial',
          url_publicacao: item.url || item.link || `${api.baseUrl}/publicacao/${item.id || ''}`
        });
      }
      
    } catch (error) {
      console.error(`Erro ao processar resposta ${api.nome}:`, error);
    }
    
    return publicacoes;
  }

  private extrairTitulo(item: any, api: TribunalAPI): string {
    return item.titulo || 
           item.assunto || 
           item.ementa || 
           `Publicação ${api.nome}` || 
           'Publicação Oficial';
  }

  private extrairConteudo(item: any): string {
    return item.conteudo || 
           item.texto || 
           item.publicacao || 
           item.ementa || 
           item.descricao || 
           '';
  }

  private extrairData(item: any): string {
    return item.dataPublicacao || 
           item.data || 
           item.dataEdicao || 
           item.timestamp || 
           new Date().toISOString();
  }

  private extrairNumeroProcesso(item: any): string | undefined {
    const numero = item.numeroProcesso || 
                   item.processo || 
                   item.numProcesso ||
                   item.identificador;
    
    if (!numero) return undefined;
    
    // Validar formato CNJ
    const formatoCNJ = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
    if (formatoCNJ.test(numero)) return numero;
    
    return numero;
  }

  private getDataInicio(): string {
    const data = new Date();
    data.setDate(data.getDate() - 7); // 7 dias atrás
    return data.toISOString().split('T')[0];
  }

  private getDataAtual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private formatarData(dataStr: string): string {
    try {
      if (!dataStr) return new Date().toISOString().split('T')[0];
      
      const data = new Date(dataStr);
      if (isNaN(data.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      
      return data.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private limparTexto(texto: string): string {
    if (!texto) return '';
    
    return texto
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '') // Remove caracteres especiais
      .trim()
      .substring(0, 1500); // Limita tamanho
  }
}
