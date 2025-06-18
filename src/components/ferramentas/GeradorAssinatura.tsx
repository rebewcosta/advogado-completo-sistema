
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Mail, Phone, MapPin, Globe, Linkedin, Instagram, FileText, Palette } from 'lucide-react';

interface FormData {
  nome: string;
  cargo: string;
  escritorio: string;
  telefone: string;
  celular: string;
  email: string;
  website: string;
  endereco: string;
  oab: string;
  linkedin: string;
  instagram: string;
  incluirTelefone: boolean;
  incluirCelular: boolean;
  incluirEndereco: boolean;
  incluirWebsite: boolean;
  incluirOab: boolean;
  incluirLinkedin: boolean;
  incluirInstagram: boolean;
  corPrimaria: string;
  corSecundaria: string;
}

export const GeradorAssinatura: React.FC = () => {
  const { toast } = useToast();
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [templateAtivo, setTemplateAtivo] = useState('classico');
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cargo: '',
    escritorio: '',
    telefone: '',
    celular: '',
    email: '',
    website: '',
    endereco: '',
    oab: '',
    linkedin: '',
    instagram: '',
    incluirTelefone: true,
    incluirCelular: true,
    incluirEndereco: true,
    incluirWebsite: true,
    incluirOab: true,
    incluirLinkedin: false,
    incluirInstagram: false,
    corPrimaria: '#1e40af',
    corSecundaria: '#64748b'
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const gerarAssinaturaClassica = () => {
    return `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.4;">
  <div style="border-left: 3px solid ${formData.corPrimaria}; padding-left: 15px;">
    <div style="font-weight: bold; font-size: 16px; color: ${formData.corPrimaria}; margin-bottom: 5px;">
      ${formData.nome}
    </div>
    ${formData.cargo ? `<div style="color: ${formData.corSecundaria}; margin-bottom: 3px;">${formData.cargo}</div>` : ''}
    ${formData.escritorio ? `<div style="font-weight: 600; color: #333; margin-bottom: 8px;">${formData.escritorio}</div>` : ''}
    
    <div style="margin-top: 8px;">
      ${formData.incluirTelefone && formData.telefone ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">📞</span> ${formData.telefone}</div>` : ''}
      ${formData.incluirCelular && formData.celular ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">📱</span> ${formData.celular}</div>` : ''}
      ${formData.email ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">✉️</span> <a href="mailto:${formData.email}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.email}</a></div>` : ''}
      ${formData.incluirWebsite && formData.website ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">🌐</span> <a href="${formData.website.startsWith('http') ? formData.website : 'https://' + formData.website}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.website}</a></div>` : ''}
      ${formData.incluirEndereco && formData.endereco ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">📍</span> ${formData.endereco}</div>` : ''}
      ${formData.incluirOab && formData.oab ? `<div style="margin-bottom: 3px;"><span style="color: ${formData.corPrimaria};">⚖️</span> OAB ${formData.oab}</div>` : ''}
    </div>
    
    ${formData.incluirLinkedin && formData.linkedin || formData.incluirInstagram && formData.instagram ? `
    <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
      ${formData.incluirLinkedin && formData.linkedin ? `<a href="${formData.linkedin.startsWith('http') ? formData.linkedin : 'https://' + formData.linkedin}" style="margin-right: 10px; color: ${formData.corPrimaria}; text-decoration: none;">LinkedIn</a>` : ''}
      ${formData.incluirInstagram && formData.instagram ? `<a href="${formData.instagram.startsWith('http') ? formData.instagram : 'https://' + formData.instagram}" style="color: ${formData.corPrimaria}; text-decoration: none;">Instagram</a>` : ''}
    </div>
    ` : ''}
  </div>
</div>`;
  };

  const gerarAssinaturaProfissional = () => {
    return `
<table style="font-family: Arial, sans-serif; font-size: 14px; color: #333; border-collapse: collapse; width: 100%; max-width: 500px;">
  <tr>
    <td style="padding: 15px; background: linear-gradient(135deg, ${formData.corPrimaria}22, ${formData.corPrimaria}11); border-radius: 8px;">
      <div style="border-left: 4px solid ${formData.corPrimaria}; padding-left: 15px;">
        <div style="font-weight: bold; font-size: 18px; color: ${formData.corPrimaria}; margin-bottom: 5px;">
          ${formData.nome}
        </div>
        ${formData.cargo ? `<div style="color: ${formData.corSecundaria}; font-weight: 600; margin-bottom: 3px;">${formData.cargo}</div>` : ''}
        ${formData.escritorio ? `<div style="font-weight: bold; color: #333; margin-bottom: 12px; font-size: 15px;">${formData.escritorio}</div>` : ''}
        
        <table style="margin-top: 10px;">
          ${formData.incluirTelefone && formData.telefone ? `
          <tr>
            <td style="padding: 2px 8px 2px 0; vertical-align: middle;">
              <div style="width: 20px; height: 20px; background: ${formData.corPrimaria}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">📞</div>
            </td>
            <td style="padding: 2px 0;">${formData.telefone}</td>
          </tr>` : ''}
          ${formData.incluirCelular && formData.celular ? `
          <tr>
            <td style="padding: 2px 8px 2px 0; vertical-align: middle;">
              <div style="width: 20px; height: 20px; background: ${formData.corPrimaria}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">📱</div>
            </td>
            <td style="padding: 2px 0;">${formData.celular}</td>
          </tr>` : ''}
          ${formData.email ? `
          <tr>
            <td style="padding: 2px 8px 2px 0; vertical-align: middle;">
              <div style="width: 20px; height: 20px; background: ${formData.corPrimaria}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">✉️</div>
            </td>
            <td style="padding: 2px 0;"><a href="mailto:${formData.email}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.email}</a></td>
          </tr>` : ''}
          ${formData.incluirWebsite && formData.website ? `
          <tr>
            <td style="padding: 2px 8px 2px 0; vertical-align: middle;">
              <div style="width: 20px; height: 20px; background: ${formData.corPrimaria}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🌐</div>
            </td>
            <td style="padding: 2px 0;"><a href="${formData.website.startsWith('http') ? formData.website : 'https://' + formData.website}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.website}</a></td>
          </tr>` : ''}
          ${formData.incluirOab && formData.oab ? `
          <tr>
            <td style="padding: 2px 8px 2px 0; vertical-align: middle;">
              <div style="width: 20px; height: 20px; background: ${formData.corPrimaria}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">⚖️</div>
            </td>
            <td style="padding: 2px 0;">OAB ${formData.oab}</td>
          </tr>` : ''}
        </table>
        
        ${formData.incluirLinkedin && formData.linkedin || formData.incluirInstagram && formData.instagram ? `
        <div style="margin-top: 12px; padding-top: 10px; border-top: 2px solid ${formData.corPrimaria};">
          ${formData.incluirLinkedin && formData.linkedin ? `<a href="${formData.linkedin.startsWith('http') ? formData.linkedin : 'https://' + formData.linkedin}" style="display: inline-block; margin-right: 15px; padding: 5px 12px; background: ${formData.corPrimaria}; color: white; text-decoration: none; border-radius: 15px; font-size: 12px; font-weight: 600;">LinkedIn</a>` : ''}
          ${formData.incluirInstagram && formData.instagram ? `<a href="${formData.instagram.startsWith('http') ? formData.instagram : 'https://' + formData.instagram}" style="display: inline-block; padding: 5px 12px; background: ${formData.corSecundaria}; color: white; text-decoration: none; border-radius: 15px; font-size: 12px; font-weight: 600;">Instagram</a>` : ''}
        </div>
        ` : ''}
      </div>
    </td>
  </tr>
</table>`;
  };

  const gerarAssinaturaModerna = () => {
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333; max-width: 450px;">
  <div style="background: linear-gradient(45deg, ${formData.corPrimaria}, ${formData.corSecundaria}); padding: 1px; border-radius: 12px;">
    <div style="background: white; padding: 20px; border-radius: 11px;">
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-weight: bold; font-size: 20px; color: ${formData.corPrimaria}; margin-bottom: 5px;">
          ${formData.nome}
        </div>
        ${formData.cargo ? `<div style="color: ${formData.corSecundaria}; font-weight: 500; margin-bottom: 3px;">${formData.cargo}</div>` : ''}
        ${formData.escritorio ? `<div style="font-weight: 600; color: #333; font-size: 16px;">${formData.escritorio}</div>` : ''}
      </div>
      
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 15px 0;">
        ${formData.incluirTelefone && formData.telefone ? `<span style="background: ${formData.corPrimaria}22; color: ${formData.corPrimaria}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500;">📞 ${formData.telefone}</span>` : ''}
        ${formData.incluirCelular && formData.celular ? `<span style="background: ${formData.corPrimaria}22; color: ${formData.corPrimaria}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500;">📱 ${formData.celular}</span>` : ''}
        ${formData.email ? `<span style="background: ${formData.corPrimaria}22; color: ${formData.corPrimaria}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500;">✉️ <a href="mailto:${formData.email}" style="color: inherit; text-decoration: none;">${formData.email}</a></span>` : ''}
        ${formData.incluirOab && formData.oab ? `<span style="background: ${formData.corSecundaria}22; color: ${formData.corSecundaria}; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: 500;">⚖️ OAB ${formData.oab}</span>` : ''}
      </div>
      
      ${formData.incluirWebsite && formData.website || formData.incluirEndereco && formData.endereco ? `
      <div style="text-align: center; margin: 10px 0; font-size: 13px;">
        ${formData.incluirWebsite && formData.website ? `<div style="margin-bottom: 3px;">🌐 <a href="${formData.website.startsWith('http') ? formData.website : 'https://' + formData.website}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.website}</a></div>` : ''}
        ${formData.incluirEndereco && formData.endereco ? `<div style="color: ${formData.corSecundaria};">📍 ${formData.endereco}</div>` : ''}
      </div>
      ` : ''}
      
      ${formData.incluirLinkedin && formData.linkedin || formData.incluirInstagram && formData.instagram ? `
      <div style="text-align: center; margin-top: 15px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        ${formData.incluirLinkedin && formData.linkedin ? `<a href="${formData.linkedin.startsWith('http') ? formData.linkedin : 'https://' + formData.linkedin}" style="display: inline-block; margin: 0 8px; padding: 6px 16px; background: ${formData.corPrimaria}; color: white; text-decoration: none; border-radius: 25px; font-size: 12px; font-weight: 600;">LinkedIn</a>` : ''}
        ${formData.incluirInstagram && formData.instagram ? `<a href="${formData.instagram.startsWith('http') ? formData.instagram : 'https://' + formData.instagram}" style="display: inline-block; margin: 0 8px; padding: 6px 16px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; text-decoration: none; border-radius: 25px; font-size: 12px; font-weight: 600;">Instagram</a>` : ''}
      </div>
      ` : ''}
    </div>
  </div>
</div>`;
  };

  const gerarAssinaturaMinimalista = () => {
    return `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
  <div style="font-weight: bold; font-size: 16px; color: ${formData.corPrimaria};">
    ${formData.nome}
  </div>
  ${formData.cargo ? `<div style="color: ${formData.corSecundaria}; margin-bottom: 2px;">${formData.cargo}</div>` : ''}
  ${formData.escritorio ? `<div style="font-weight: 600; margin-bottom: 8px;">${formData.escritorio}</div>` : ''}
  
  <div style="font-size: 13px;">
    ${formData.email ? `<a href="mailto:${formData.email}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.email}</a>` : ''}
    ${formData.incluirTelefone && formData.telefone ? ` | ${formData.telefone}` : ''}
    ${formData.incluirCelular && formData.celular ? ` | ${formData.celular}` : ''}
    ${formData.incluirOab && formData.oab ? ` | OAB ${formData.oab}` : ''}
  </div>
  
  ${formData.incluirWebsite && formData.website ? `<div style="margin-top: 5px; font-size: 13px;"><a href="${formData.website.startsWith('http') ? formData.website : 'https://' + formData.website}" style="color: ${formData.corPrimaria}; text-decoration: none;">${formData.website}</a></div>` : ''}
  ${formData.incluirEndereco && formData.endereco ? `<div style="color: ${formData.corSecundaria}; font-size: 13px;">${formData.endereco}</div>` : ''}
</div>`;
  };

  const obterAssinaturaAtual = () => {
    switch (templateAtivo) {
      case 'profissional':
        return gerarAssinaturaProfissional();
      case 'moderno':
        return gerarAssinaturaModerna();
      case 'minimalista':
        return gerarAssinaturaMinimalista();
      default:
        return gerarAssinaturaClassica();
    }
  };

  const obterTextoSimples = () => {
    let texto = `${formData.nome}\n`;
    if (formData.cargo) texto += `${formData.cargo}\n`;
    if (formData.escritorio) texto += `${formData.escritorio}\n\n`;
    
    if (formData.email) texto += `E-mail: ${formData.email}\n`;
    if (formData.incluirTelefone && formData.telefone) texto += `Telefone: ${formData.telefone}\n`;
    if (formData.incluirCelular && formData.celular) texto += `Celular: ${formData.celular}\n`;
    if (formData.incluirWebsite && formData.website) texto += `Website: ${formData.website}\n`;
    if (formData.incluirEndereco && formData.endereco) texto += `Endereço: ${formData.endereco}\n`;
    if (formData.incluirOab && formData.oab) texto += `OAB: ${formData.oab}\n`;
    
    if (formData.incluirLinkedin && formData.linkedin) texto += `LinkedIn: ${formData.linkedin}\n`;
    if (formData.incluirInstagram && formData.instagram) texto += `Instagram: ${formData.instagram}\n`;
    
    return texto;
  };

  const copiarHtml = async () => {
    try {
      await navigator.clipboard.writeText(obterAssinaturaAtual());
      setCopiedHtml(true);
      toast({
        title: "Copiado!",
        description: "Código HTML da assinatura copiado para a área de transferência",
      });
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código HTML",
        variant: "destructive"
      });
    }
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(obterTextoSimples());
      setCopiedText(true);
      toast({
        title: "Copiado!",
        description: "Texto simples da assinatura copiado para a área de transferência",
      });
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Dados da Assinatura
            </CardTitle>
            <CardDescription>
              Preencha suas informações profissionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo/Função</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  placeholder="Advogado, Sócio, etc."
                />
              </div>
              <div>
                <Label htmlFor="escritorio">Escritório/Empresa</Label>
                <Input
                  id="escritorio"
                  value={formData.escritorio}
                  onChange={(e) => handleInputChange('escritorio', e.target.value)}
                  placeholder="Nome do escritório"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 3333-4444"
                />
              </div>
              <div>
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  placeholder="(11) 99999-8888"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www.meuescritorio.com.br"
                />
              </div>
              <div>
                <Label htmlFor="oab">OAB</Label>
                <Input
                  id="oab"
                  value={formData.oab}
                  onChange={(e) => handleInputChange('oab', e.target.value)}
                  placeholder="123456/SP"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade - CEP"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/seuperfil"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="instagram.com/seuperfil"
                />
              </div>
            </div>

            {/* Personalização de cores */}
            <div className="pt-4 border-t">
              <Label className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4" />
                Personalização de Cores
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corPrimaria">Cor Primária</Label>
                  <Input
                    id="corPrimaria"
                    type="color"
                    value={formData.corPrimaria}
                    onChange={(e) => handleInputChange('corPrimaria', e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="corSecundaria">Cor Secundária</Label>
                  <Input
                    id="corSecundaria"
                    type="color"
                    value={formData.corSecundaria}
                    onChange={(e) => handleInputChange('corSecundaria', e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </div>

            {/* Opções de inclusão */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-3 block">
                Campos a incluir na assinatura:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirTelefone"
                    checked={formData.incluirTelefone}
                    onCheckedChange={(checked) => handleInputChange('incluirTelefone', !!checked)}
                  />
                  <Label htmlFor="incluirTelefone" className="text-sm">Telefone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirCelular"
                    checked={formData.incluirCelular}
                    onCheckedChange={(checked) => handleInputChange('incluirCelular', !!checked)}
                  />
                  <Label htmlFor="incluirCelular" className="text-sm">Celular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirEndereco"
                    checked={formData.incluirEndereco}
                    onCheckedChange={(checked) => handleInputChange('incluirEndereco', !!checked)}
                  />
                  <Label htmlFor="incluirEndereco" className="text-sm">Endereço</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirWebsite"
                    checked={formData.incluirWebsite}
                    onCheckedChange={(checked) => handleInputChange('incluirWebsite', !!checked)}
                  />
                  <Label htmlFor="incluirWebsite" className="text-sm">Website</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirOab"
                    checked={formData.incluirOab}
                    onCheckedChange={(checked) => handleInputChange('incluirOab', !!checked)}
                  />
                  <Label htmlFor="incluirOab" className="text-sm">OAB</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirLinkedin"
                    checked={formData.incluirLinkedin}
                    onCheckedChange={(checked) => handleInputChange('incluirLinkedin', !!checked)}
                  />
                  <Label htmlFor="incluirLinkedin" className="text-sm">LinkedIn</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirInstagram"
                    checked={formData.incluirInstagram}
                    onCheckedChange={(checked) => handleInputChange('incluirInstagram', !!checked)}
                  />
                  <Label htmlFor="incluirInstagram" className="text-sm">Instagram</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview e Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Preview da Assinatura</CardTitle>
            <CardDescription>
              Visualize como ficará sua assinatura de e-mail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={templateAtivo} onValueChange={setTemplateAtivo} className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="classico">Clássico</TabsTrigger>
                <TabsTrigger value="profissional">Profissional</TabsTrigger>
                <TabsTrigger value="moderno">Moderno</TabsTrigger>
                <TabsTrigger value="minimalista">Minimalista</TabsTrigger>
              </TabsList>

              <TabsContent value="classico" className="space-y-4">
                <Badge variant="outline">Template Clássico</Badge>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: gerarAssinaturaClassica() }} />
                </div>
              </TabsContent>

              <TabsContent value="profissional" className="space-y-4">
                <Badge variant="outline">Template Profissional</Badge>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: gerarAssinaturaProfissional() }} />
                </div>
              </TabsContent>

              <TabsContent value="moderno" className="space-y-4">
                <Badge variant="outline">Template Moderno</Badge>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: gerarAssinaturaModerna() }} />
                </div>
              </TabsContent>

              <TabsContent value="minimalista" className="space-y-4">
                <Badge variant="outline">Template Minimalista</Badge>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: gerarAssinaturaMinimalista() }} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={copiarHtml} className="flex-1">
                {copiedHtml ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedHtml ? 'Copiado!' : 'Copiar HTML'}
              </Button>
              <Button onClick={copiarTexto} variant="outline" className="flex-1">
                {copiedText ? <Check className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                {copiedText ? 'Copiado!' : 'Copiar Texto'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar sua assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Para Gmail:</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Abra as configurações do Gmail</li>
                <li>2. Vá para "Geral" → "Assinatura"</li>
                <li>3. Cole o código HTML copiado</li>
                <li>4. Salve as alterações</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Para Outlook:</h4>
              <ol className="text-sm space-y-1 text-gray-600">
                <li>1. Arquivo → Opções → Email</li>
                <li>2. Clique em "Assinaturas"</li>
                <li>3. Cole o código HTML</li>
                <li>4. Configure para novos emails</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
