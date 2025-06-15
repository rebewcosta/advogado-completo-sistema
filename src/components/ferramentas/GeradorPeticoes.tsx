
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Copy } from 'lucide-react';

interface TemplateData {
  tipoPeticao: string;
  nomeAdvogado: string;
  oab: string;
  nomeCliente: string;
  documentoCliente: string;
  numeroProcesso: string;
  vara: string;
  comarca: string;
  objetivo: string;
  fundamentacao: string;
}

export const GeradorPeticoes: React.FC = () => {
  const { toast } = useToast();
  const [dados, setDados] = useState<TemplateData>({
    tipoPeticao: '',
    nomeAdvogado: '',
    oab: '',
    nomeCliente: '',
    documentoCliente: '',
    numeroProcesso: '',
    vara: '',
    comarca: '',
    objetivo: '',
    fundamentacao: ''
  });
  const [peticaoGerada, setPeticaoGerada] = useState('');

  const tiposPeticao = [
    { value: 'inicial', label: 'Petição Inicial' },
    { value: 'contestacao', label: 'Contestação' },
    { value: 'recurso', label: 'Recurso de Apelação' },
    { value: 'embargos', label: 'Embargos de Declaração' },
    { value: 'manifestacao', label: 'Manifestação' },
    { value: 'requerimento', label: 'Requerimento' },
  ];

  const templates = {
    inicial: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {vara} DA COMARCA DE {comarca}

{nomeAdvogado}, brasileiro(a), advogado(a), inscrito(a) na OAB sob o nº {oab}, em nome e por conta de {nomeCliente}, portador(a) do CPF/CNPJ nº {documentoCliente}, vem respeitosamente à presença de Vossa Excelência propor a presente

AÇÃO {objetivo}

em face de [RÉCOMPOR], pelos fatos e fundamentos jurídicos a seguir expostos:

I - DOS FATOS

{fundamentacao}

II - DO DIREITO

[Fundamentação jurídica a ser desenvolvida]

III - DOS PEDIDOS

Diante do exposto, requer-se:

a) A citação do(a) requerido(a) para responder aos termos da presente ação;
b) {objetivo};
c) A condenação do(a) requerido(a) ao pagamento das custas processuais e honorários advocatícios;
d) A produção de todas as provas em direito admitidas.

Dá-se à causa o valor de R$ [VALOR].

Termos em que,
Pede deferimento.

{comarca}, [DATA]

_________________________
{nomeAdvogado}
OAB {oab}`,

    contestacao: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {vara} DA COMARCA DE {comarca}

Processo nº {numeroProcesso}

{nomeAdvogado}, brasileiro(a), advogado(a), inscrito(a) na OAB sob o nº {oab}, em nome e por conta de {nomeCliente}, portador(a) do CPF/CNPJ nº {documentoCliente}, já qualificado(a) nos autos da ação em epígrafe, vem respeitosamente à presença de Vossa Excelência apresentar

CONTESTAÇÃO

tempestivamente oferecida, pelos fatos e fundamentos jurídicos a seguir expostos:

I - PRELIMINARES

[A serem desenvolvidas conforme o caso]

II - DO MÉRITO

{fundamentacao}

III - DOS PEDIDOS

Diante do exposto, requer-se:

a) O acolhimento das preliminares arguidas, com a consequente extinção do processo;
b) Subsidiariamente, a total improcedência da ação;
c) A condenação do(a) autor(a) ao pagamento das custas processuais e honorários advocatícios;
d) A produção de todas as provas em direito admitidas.

Termos em que,
Pede deferimento.

{comarca}, [DATA]

_________________________
{nomeAdvogado}
OAB {oab}`,

    recurso: `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) RELATOR(A)

Processo nº {numeroProcesso}

{nomeAdvogado}, brasileiro(a), advogado(a), inscrito(a) na OAB sob o nº {oab}, em nome e por conta de {nomeCliente}, portador(a) do CPF/CNPJ nº {documentoCliente}, vem respeitosamente à presença de Vossa Excelência interpor

RECURSO DE APELAÇÃO

da r. sentença proferida nos autos em epígrafe, pelos fundamentos a seguir expostos:

I - DA TEMPESTIVIDADE

O presente recurso é tempestivo, conforme se verifica da certidão de publicação.

II - DO PREPARO

O preparo será recolhido na forma da lei.

III - DOS FUNDAMENTOS

{fundamentacao}

IV - DOS PEDIDOS

Diante do exposto, requer-se:

a) O conhecimento e provimento do presente recurso;
b) {objetivo};
c) A reforma da r. sentença recorrida.

Termos em que,
Pede deferimento.

{comarca}, [DATA]

_________________________
{nomeAdvogado}
OAB {oab}`
  };

  const gerarPeticao = () => {
    if (!dados.tipoPeticao || !dados.nomeAdvogado || !dados.oab || !dados.nomeCliente) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha pelo menos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const template = templates[dados.tipoPeticao as keyof typeof templates];
    if (!template) {
      toast({
        title: "Template não encontrado",
        description: "Selecione um tipo de petição válido.",
        variant: "destructive",
      });
      return;
    }

    let peticao = template;
    
    // Substituir placeholders
    Object.entries(dados).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      peticao = peticao.replace(new RegExp(placeholder, 'g'), value || '[A PREENCHER]');
    });

    // Adicionar data atual
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    peticao = peticao.replace(/\[DATA\]/g, dataAtual);

    setPeticaoGerada(peticao);
    
    toast({
      title: "Petição gerada",
      description: "Template da petição foi gerado com sucesso!",
    });
  };

  const copiarTexto = () => {
    navigator.clipboard.writeText(peticaoGerada);
    toast({
      title: "Texto copiado",
      description: "O texto da petição foi copiado para a área de transferência.",
    });
  };

  const baixarArquivo = () => {
    const elemento = document.createElement('a');
    const arquivo = new Blob([peticaoGerada], { type: 'text/plain' });
    elemento.href = URL.createObjectURL(arquivo);
    elemento.download = `peticao_${dados.tipoPeticao}_${new Date().getTime()}.txt`;
    document.body.appendChild(elemento);
    elemento.click();
    document.body.removeChild(elemento);
    
    toast({
      title: "Arquivo baixado",
      description: "A petição foi salva como arquivo de texto.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gerador de Petições Básicas
        </CardTitle>
        <CardDescription>
          Gere templates básicos de petições jurídicas para agilizar seu trabalho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipoPeticao">Tipo de Petição *</Label>
            <Select value={dados.tipoPeticao} onValueChange={(value) => setDados({...dados, tipoPeticao: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposPeticao.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="nomeAdvogado">Nome do Advogado *</Label>
            <Input
              id="nomeAdvogado"
              value={dados.nomeAdvogado}
              onChange={(e) => setDados({...dados, nomeAdvogado: e.target.value})}
              placeholder="João Silva"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="oab">Número da OAB *</Label>
            <Input
              id="oab"
              value={dados.oab}
              onChange={(e) => setDados({...dados, oab: e.target.value})}
              placeholder="12345/SP"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
            <Input
              id="nomeCliente"
              value={dados.nomeCliente}
              onChange={(e) => setDados({...dados, nomeCliente: e.target.value})}
              placeholder="Maria Santos"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="documentoCliente">CPF/CNPJ do Cliente</Label>
            <Input
              id="documentoCliente"
              value={dados.documentoCliente}
              onChange={(e) => setDados({...dados, documentoCliente: e.target.value})}
              placeholder="123.456.789-01"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="numeroProcesso">Número do Processo</Label>
            <Input
              id="numeroProcesso"
              value={dados.numeroProcesso}
              onChange={(e) => setDados({...dados, numeroProcesso: e.target.value})}
              placeholder="1234567-89.2024.8.26.0001"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="vara">Vara</Label>
            <Input
              id="vara"
              value={dados.vara}
              onChange={(e) => setDados({...dados, vara: e.target.value})}
              placeholder="1ª Vara Cível"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="comarca">Comarca</Label>
            <Input
              id="comarca"
              value={dados.comarca}
              onChange={(e) => setDados({...dados, comarca: e.target.value})}
              placeholder="São Paulo"
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="objetivo">Objetivo/Pedido Principal</Label>
          <Input
            id="objetivo"
            value={dados.objetivo}
            onChange={(e) => setDados({...dados, objetivo: e.target.value})}
            placeholder="Ex: cobrança, indenização, rescisão contratual"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="fundamentacao">Fundamentação/Fatos</Label>
          <Textarea
            id="fundamentacao"
            value={dados.fundamentacao}
            onChange={(e) => setDados({...dados, fundamentacao: e.target.value})}
            placeholder="Descreva brevemente os fatos e a fundamentação legal..."
            rows={4}
            className="mt-1"
          />
        </div>

        <Button 
          onClick={gerarPeticao} 
          className="w-full"
          disabled={!dados.tipoPeticao || !dados.nomeAdvogado || !dados.oab || !dados.nomeCliente}
        >
          <FileText className="h-4 w-4 mr-2" />
          Gerar Petição
        </Button>

        {peticaoGerada && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Petição Gerada</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copiarTexto}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button variant="outline" size="sm" onClick={baixarArquivo}>
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-96 overflow-y-auto">
                {peticaoGerada}
              </pre>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Este é apenas um template básico. Sempre revise e adapte o conteúdo 
                conforme as especificidades do caso e a legislação aplicável.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
