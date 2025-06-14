
export class ProxyService {
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
  ];

  private requestCount = 0;
  private lastRequestTime = 0;

  async fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    // Implementar delay adaptativo
    await this.implementarDelay();
    
    const headers = this.gerarHeadersRealisticos(url);
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
      signal: AbortSignal.timeout(15000) // 15 segundos timeout
    };

    try {
      console.log(`🌐 Fazendo request para: ${new URL(url).hostname}`);
      const response = await fetch(url, requestOptions);
      
      this.requestCount++;
      this.lastRequestTime = Date.now();
      
      return response;
    } catch (error) {
      console.error(`❌ Erro na requisição para ${url}:`, error);
      throw error;
    }
  }

  private async implementarDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Delay baseado no número de requests
    let delay = 1000; // 1 segundo base
    
    if (this.requestCount > 10) {
      delay = 3000; // 3 segundos após 10 requests
    } else if (this.requestCount > 5) {
      delay = 2000; // 2 segundos após 5 requests
    }

    // Se o último request foi muito recente, esperar mais
    if (timeSinceLastRequest < delay) {
      const waitTime = delay - timeSinceLastRequest;
      console.log(`⏱️ Aguardando ${waitTime}ms antes do próximo request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private gerarHeadersRealisticos(url: string): Record<string, string> {
    const domain = new URL(url).hostname;
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    return {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'Referer': `https://${domain}/`
    };
  }

  resetCounters(): void {
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }
}
