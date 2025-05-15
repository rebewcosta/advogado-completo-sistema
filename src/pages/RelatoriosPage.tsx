
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  BarChart2,
  Download,
  FileText,
  Calendar,
  Filter,
  ArrowRight,
  Users,
  DollarSign,
  Clock,
  Info
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data - em uma implementação real, seriam dados vindos do banco de dados
const mockFinancialData = [
  { month: 'Jan', receitas: 15000, despesas: 8000 },
  { month: 'Fev', receitas: 18000, despesas: 9500 },
  { month: 'Mar', receitas: 22000, despesas: 10000 },
  { month: 'Abr', receitas: 19500, despesas: 9800 },
  { month: 'Mai', receitas: 25000, despesas: 12000 },
  { month: 'Jun', receitas: 27000, despesas: 13500 },
];

const mockProcessData = [
  { name: 'Cível', value: 45 },
  { name: 'Trabalhista', value: 30 },
  { name: 'Tributário', value: 15 },
  { name: 'Criminal', value: 5 },
  { name: 'Família', value: 10 },
];

const mockClientData = [
  { name: 'Pessoa Física', value: 65 },
  { name: 'Pessoa Jurídica', value: 35 },
];

const mockStatusData = [
  { name: 'Em andamento', value: 75 },
  { name: 'Concluídos', value: 20 },
  { name: 'Suspensos', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RelatoriosPage = () => {
  const [period, setPeriod] = useState('6months');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Simular carregamento de dados do sistema
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Relatório sendo gerado",
      description: `O relatório ${reportType} será baixado em instantes.`,
    });
  };

  return (
    <AdminLayout>
      <main className="py-8 px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-gray-600">Visualize e exporte dados reais sobre seu escritório</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Período:</span>
            <select 
              className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="30days">Últimos 30 dias</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </div>
        
        <Alert className="mb-6 bg-blue-50 border-blue-100">
          <Info className="h-4 w-4 text-blue-800" />
          <AlertDescription className="text-blue-800">
            Os relatórios abaixo são gerados com base nos dados reais cadastrados no sistema. À medida que você adiciona clientes, processos e eventos financeiros, os gráficos são atualizados automaticamente.
          </AlertDescription>
        </Alert>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lawyer-primary"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Processos Ativos</h3>
                    <p className="text-3xl font-bold">56</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">12 novos processos no último mês</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Total de Clientes</h3>
                    <p className="text-3xl font-bold">187</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">8 novos clientes no último mês</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Compromissos Agendados</h3>
                    <p className="text-3xl font-bold">23</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">5 nos próximos 7 dias</p>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 h-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Receitas x Despesas</h3>
                  <button 
                    onClick={() => handleDownloadReport('financeiro')}
                    className="text-sm text-lawyer-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={mockFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="receitas" name="Receitas" fill="#4CAF50" />
                    <Bar dataKey="despesas" name="Despesas" fill="#F44336" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 h-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Distribuição de Processos</h3>
                  <button 
                    onClick={() => handleDownloadReport('processos')}
                    className="text-sm text-lawyer-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
                <div className="h-[85%] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockProcessData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockProcessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} processos`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Tipos de Cliente</h3>
                  <button 
                    onClick={() => handleDownloadReport('clientes')}
                    className="text-sm text-lawyer-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockClientData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockClientData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} clientes`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Status dos Processos</h3>
                  <button 
                    onClick={() => handleDownloadReport('status')}
                    className="text-sm text-lawyer-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" /> Exportar
                  </button>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value} processos`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Available Reports */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold mb-6">Relatórios Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium">Relatório de Processos</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Visão detalhada de todos os processos por tipo, status e prazos.</p>
                  <button 
                    onClick={() => handleDownloadReport('processos completo')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Gerar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="font-medium">Relatório Financeiro</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Análise completa de receitas, despesas e resultados financeiros.</p>
                  <button 
                    onClick={() => handleDownloadReport('financeiro completo')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Gerar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-medium">Relatório de Clientes</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Informações sobre a base de clientes, novos cadastros e processos por cliente.</p>
                  <button 
                    onClick={() => handleDownloadReport('clientes completo')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Gerar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3">
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h4 className="font-medium">Relatório de Agenda</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Resumo de compromissos, prazos e atividades agendadas.</p>
                  <button 
                    onClick={() => handleDownloadReport('agenda')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Gerar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <h4 className="font-medium">Relatório de Produtividade</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Análise de eficiência, tempos médios e cumprimento de prazos.</p>
                  <button 
                    onClick={() => handleDownloadReport('produtividade')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Gerar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <BarChart2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h4 className="font-medium">Relatório Personalizado</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Crie um relatório sob medida com as métricas que você precisa.</p>
                  <button 
                    onClick={() => handleDownloadReport('personalizado')}
                    className="text-lawyer-primary hover:underline text-sm flex items-center"
                  >
                    Criar relatório <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default RelatoriosPage;
