
import { PublicacaoEncontrada } from '../scrapers/types.ts';
import { ProxyService } from './proxyService.ts';

export class RealScraperService {
  private proxyService = new ProxyService();
  
  private readonly sites = [
    { estado: 'SP', url: 'https://www.imprensaoficial.com.br/DO/BuscaImpressaView.aspx', selector: '.conteudo-jornal' },
    { estado: 'RJ', url: 'http://www.ioerj.com.br/portal/modules/conteudoonline/mostra_edicao.php', selector: '.texto-diario' },
    { estado: 'MG', url: 'https://www.jornalminasgerais.mg.gov.br/', selector: '.content-text' },
    { estado: 'RS', url: 'https://www.corag.com.br/doe', selector: '.publicacao-content' },
    { estado: 'PR', url: 'https://www.aen.pr.gov.br/Diario', selector: '.diario-content' },
    { estado: 'SC', url: 'https://doe.sea.sc.gov.br/', selector: '.doe-content' },
    { estado: 'CE', url: 'https://www.doe.seplag.ce.gov.br/', selector: '.doe-texto' },
    { estado: 'BA', url: 'http://www.egba.ba.gov.br/', selector: '.publicacao-texto' },
    { estado: 'GO', url: 'https://www.dio.go.gov.br/', selector: '.dio-content' },
    { estado: 'PE', url: 'https://www.cepe.com.br/diario-oficial', selector: '.diario-texto' }
  ];

  async buscarPublicacoes(nomes: string[], estadosEspecificos: string[] = []): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    console.log('🌐 Iniciando scraping REAL dos sites oficiais...');
    
    const sitesParaBuscar = estadosEspecificos.length > 0 
      ? this.sites.filter(site => estadosEspecificos.includes(site.estado))
      : this.sites;

    // Reset contadores do proxy
    this.proxyService.resetCounters();

    // Processar em batches pequenos para evitar bloqueios
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < sitesParaBuscar.length; i += BATCH_SIZE) {
      const batch = sitesParaBuscar.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(site => this.buscarNoSite(site, nomes));
      
      try {
        const resultados = await Promise.allSettled(promises);
        
        resultados.forEach((resultado, index) => {
          if (resultado.status === 'fulfilled') {
            publicacoes.push(...resultado.value);
            console.log(`✅ ${batch[index].estado}: ${resultado.value.length} publicações`);
          } else {
            console.error(`❌ Erro ${batch[index].estado}:`, resultado.reason);
          }
        });
        
        // Pausa maior entre batches
        if (i + BATCH_SIZE < sitesParaBuscar.length) {
          console.log('⏸️ Pausa entre batches...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error('❌ Erro no batch:', error);
      }
    }
    
    console.log(`✅ Scraping real: ${publicacoes.length} publicações encontradas`);
    return publicacoes;
  }

  private async buscarNoSite(site: any, nomes: string[]): Promise<PublicacaoEncontrada[]> {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      console.log(`🔍 Buscando em ${site.estado}: ${site.url}`);
      
      const response = await this.proxyService.fetchWithProxy(site.url);
      
      if (!response.ok) {
        console.log(`⚠️ ${site.estado}: HTTP ${response.status}`);
        return publicacoes;
      }

      const html = await response.text();
      
      if (!html || html.length < 1000) {
        console.log(`⚠️ ${site.estado}: Conteúdo insuficiente`);
        return publicacoes;
      }

      // Buscar cada nome no HTML
      for (const nome of nomes) {
        const encontradas = this.buscarNomeNoHtml(html, nome, site);
        publicacoes.push(...encontradas);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao buscar em ${site.estado}:`, error);
    }
    
    return publicacoes;
  }

  private buscarNomeNoHtml(html: string, nome: string, site: any): PublicacaoEncontrada[] {
    const publicacoes: PublicacaoEncontrada[] = [];
    
    try {
      const nomeNormalizado = nome.toLowerCase().trim();
      const htmlNormalizado = html.toLowerCase();
      
      if (!htmlNormalizado.includes(nomeNormalizado)) {
        return publicacoes;
      }

      // Buscar contexto mais amplo ao redor do nome
      const regex = new RegExp(`.{0,500}${nome.replace(/\s+/g, '\\s+')}.{0,500}`, 'gi');
      const matches = html.match(regex);
      
      if (matches) {
        for (const match of matches.slice(0, 2)) { // Máximo 2 por nome por site
          const contexto = this.extrairContexto(match, html);
          
          publicacoes.push({
            nome_advogado: nome,
            titulo_publicacao: `Publicação Oficial ${site.estado}`,
            conteudo_publicacao: this.limparTexto(contexto),
            data_publicacao: new Date().toISOString().split('T')[0],
            diario_oficial: `Diário Oficial ${site.estado}`,
            estado: site.estado,
            numero_processo: this.extrairNumeroProcesso(contexto),
            tipo_publicacao: 'Diário Oficial',
            url_publicacao: site.url
          });
        }
      }
      
    } catch (error) {
      console.error(`Erro ao buscar ${nome} em ${site.estado}:`, error);
    }
    
    return publicacoes;
  }

  private extrairContexto(match: string, html: string): string {
    // Tentar encontrar mais contexto ao redor do match
    const index = html.indexOf(match);
    if (index !== -1) {
      const start = Math.max(0, index - 300);
      const end = Math.min(html.length, index + match.length + 300);
      return html.substring(start, end);
    }
    return match;
  }

  private extrairNumeroProcesso(texto: string): string | undefined {
    // Padrões de números de processo brasileiros
    const padroes = [
      /\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}/g, // Padrão CNJ
      /\d{6,7}\/\d{4}/g, // Padrão antigo
      /\d{4}\.\d{2}\.\d{4}\.\d{6}-\d{1}/g // Variação
    ];
    
    for (const padrao of padroes) {
      const match = texto.match(padrao);
      if (match) return match[0];
    }
    
    return undefined;
  }

  private limparTexto(texto: string): string {
    return texto
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/[^\w\sÀ-ÿ\-.,():/]/g, '') // Remove caracteres especiais
      .trim()
      .substring(0, 1200); // Limita tamanho
  }
}
