
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const ModernPrazosContent: React.FC = () => {
  const prazos = [
    { id: 1, titulo: 'Contestação - Processo 001', dias: 2, status: 'urgente' },
    { id: 2, titulo: 'Recurso - Processo 002', dias: 7, status: 'atencao' },
    { id: 3, titulo: 'Peticionamento - Processo 003', dias: 15, status: 'normal' }
  ];

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
        <CardTitle className="text-xl font-bold flex items-center">
          <Clock className="mr-3 h-6 w-6" />
          Prazos Próximos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {prazos.map((prazo) => (
            <div key={prazo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  prazo.status === 'urgente' ? 'bg-red-100 text-red-600' :
                  prazo.status === 'atencao' ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {prazo.status === 'urgente' ? <AlertTriangle className="h-4 w-4" /> :
                   prazo.status === 'atencao' ? <Clock className="h-4 w-4" /> :
                   <CheckCircle className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{prazo.titulo}</h4>
                  <p className={`text-sm ${
                    prazo.status === 'urgente' ? 'text-red-600' :
                    prazo.status === 'atencao' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {prazo.dias} dias restantes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernPrazosContent;
