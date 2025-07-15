import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, MapPin, Globe, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OfficeData {
  companyName?: string;
  cnpj?: string;
  address?: string;
  website?: string;
  phone?: string;
  logo_url?: string;
}

interface OfficeInfoHeaderProps {
  officeData: OfficeData;
}

const OfficeInfoHeader: React.FC<OfficeInfoHeaderProps> = ({ officeData }) => {
  const navigate = useNavigate();

  // Verifica se tem dados básicos configurados
  const hasOfficeData = officeData.companyName && 
                       officeData.companyName !== "Meu Escritório de Advocacia" &&
                       officeData.companyName.trim() !== "";

  const handleConfigureClick = () => {
    navigate('/configuracoes?tab=escritorio');
  };

  if (!hasOfficeData) {
    return (
      <Card className="mb-6 border-2 border-dashed border-blue-300 bg-blue-50/50">
        <CardContent className="py-6 px-4 sm:px-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Configure os dados do seu escritório
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
              Personalize seu dashboard com as informações do seu escritório. 
              Isso ajuda a identificar melhor sua empresa no sistema.
            </p>
            <Button 
              onClick={handleConfigureClick}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Clique aqui e configure
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          {/* Logo ou ícone padrão */}
          <div className="flex-shrink-0 self-center sm:self-start">
            {officeData.logo_url ? (
              <img 
                src={officeData.logo_url} 
                alt="Logo do escritório"
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain rounded-lg border border-gray-200 bg-white p-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-lg flex items-center justify-center ${officeData.logo_url ? 'hidden' : 'flex'}`}
            >
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
          </div>

          {/* Informações do escritório */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-1 truncate">
              {officeData.companyName}
            </h2>
            
            <div className="space-y-1 text-center sm:text-left">
              {officeData.phone && (
                <p className="text-sm text-gray-600">
                  Telefone: {officeData.phone}
                </p>
              )}
              
              {officeData.address && (
                <div className="flex items-start gap-1 justify-center sm:justify-start">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {officeData.address}
                  </p>
                </div>
              )}
              
              {officeData.website && (
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <a 
                    href={officeData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {officeData.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Botão de editar */}
          <div className="flex-shrink-0 self-center sm:self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfigureClick}
              className="text-gray-600 hover:text-gray-800 border-gray-300"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Editar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeInfoHeader;