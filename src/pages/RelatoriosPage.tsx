
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Função para filtrar dados por período
const filterDataByPeriod = (data: any[], period: string) => {
  const now = new Date();
  let startDate: Date;

  switch(period) {
    case '30days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '3months':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '6months':
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case '1year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 6)); // Default to 6 months
  }

  return data.filter(item => new Date(item.created_at || item.data || Date.now()) >= startDate);
};

// Função para gerar dados financeiros a partir do localStorage
const generateFinancialData = (period: string) => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const financeData = localStorage.getItem('financialData') ? 
    JSON.parse(localStorage.getItem('financialData') || '[]') : 
    [];
  
  const filteredData = filterDataByPeriod(financeData, period);
  
  // Agrupar por mês
  const monthlyData = months.map(month => {
    const monthData = filteredData.filter((item: any) => {
      const date = new Date(item.data);
      return months[date.getMonth()] === month;
    });
    
    const receitas = monthData
      .filter((item: any) => item.tipo === 'receita')
      .reduce((acc: number, curr: any) => acc + parseFloat(curr.valor || 0), 0);
      
    const despesas = monthData
      .filter((item: any) => item.tipo === 'despesa')
      .reduce((acc: number, curr: any) => acc + parseFloat(curr.valor || 0), 0);
    
    return { month, receitas, despesas };
  });

  return monthlyData;
};

// Função para gerar dados de processos
const generateProcessData = () => {
  const processes = localStorage.getItem('processes') ? 
    JSON.parse(localStorage.getItem('processes') || '[]') : 
    [];
  
  if (processes.length === 0) {
    return [{ name: 'Sem dados', value: 1 }];
  }

  // Agrupar por tipo
  const typeCount: Record<string, number> = {};
  processes.forEach((process: any) => {
    const type = process.tipo || 'Não especificado';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  return Object.keys(typeCount).map(type => ({
    name: type,
    value: typeCount[type]
  }));
};

// Função para gerar dados de clientes
const generateClientData = () => {
  const clients = localStorage.getItem('clients') ? 
    JSON.parse(localStorage.getItem('clients') || '[]') : 
    [];
  
  if (clients.length === 0) {
    return [{ name: 'Sem dados', value: 1 }];
  }

  // Agrupar por tipo
  const typeCount: Record<string, number> = {};
  clients.forEach((client: any) => {
    const type = client.tipo || 'Não especificado';
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  return Object.keys(typeCount).map(type => ({
    name: type,
    value: typeCount[type]
  }));
};

// Função para gerar dados de status de processos
const generateStatusData = () => {
  const processes = localStorage.getItem('processes') ? 
    JSON.parse(localStorage.getItem('processes') || '[]') : 
    [];
  
  if (processes.length === 0) {
    return [{ name: 'Sem dados', value: 1 }];
  }

  // Agrupar por status
  const statusCount: Record<string, number> = {};
  processes.forEach((process: any) => {
    const status = process.status || 'Não especificado';
    statusCount[status] = (statusCount[status] || 0) + 1;
  });
  
  return Object.keys(statusCount).map(status => ({
    name: status,
    value: statusCount[status]
  }));
};

const RelatoriosPage = () => {
  const [period, setPeriod] = useState('6months');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Estados para os dados
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [processData, setProcessData] = useState<any[]>([]);
  const [clientData, setClientData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [processCount, setProcessCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  // Carregar dados ao iniciar e quando o período mudar
  useEffect(() => {
    setIsLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      // Atualizar dados com base no período selecionado
      setFinancialData(generateFinancialData(period));
      setProcessData(generateProcessData());
      setClientData(generateClientData());
      setStatusData(generateStatusData());
      
      // Contar clientes, processos e eventos
      const clients = localStorage.getItem('clients') ? 
        JSON.parse(localStorage.getItem('clients') || '[]') : 
        [];
      
      const processes = localStorage.getItem('processes') ? 
        JSON.parse(localStorage.getItem('processes') || '[]') : 
        [];
        
      const events = localStorage.getItem('events') ? 
        JSON.parse(localStorage.getItem('events') || '[]') : 
        [];
      
      setClientCount(clients.length);
      setProcessCount(processes.length);
      setEventCount(events.length);
      
      setIsLoading(false);
    }, 800);
  }, [period]);
  
  const handleDownloadReport = (reportType: string) => {
    // Gerar dados do relatório
    let reportData: any = {};
    
    switch(reportType) {
      case 'financeiro':
      case 'financeiro completo':
        reportData = financialData;
        break;
      case 'processos':
      case 'processos completo':
        reportData = processData;
        break;
      case 'clientes':
      case 'clientes completo':
        reportData = clientData;
        break;
      case 'status':
        reportData = statusData;
        break;
      case 'agenda':
        reportData = localStorage.getItem('events') ? 
          JSON.parse(localStorage.getItem('events') || '[]') : 
          [];
        break;
      default:
        reportData = { message: 'Relatório personalizado' };
    }
    
    // Converter para CSV ou JSON
    const filename = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    const jsonStr = JSON.stringify(reportData, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    
    // Criar elemento para download
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Relatório gerado",
      description: `O relatório ${reportType} foi baixado com sucesso.`,
    });
  };

  // Dados para gráficos vazios
  const emptyFinancialData = [
    { month: 'Jan', receitas: 0, despesas: 0 },
    { month: 'Fev', receitas: 0, despesas: 0 },
    { month: 'Mar', receitas: 0, despesas: 0 },
    { month: 'Abr', receitas: 0, despesas: 0 },
    { month: 'Mai', receitas: 0, despesas: 0 },
    { month: 'Jun', receitas: 0, despesas: 0 },
  ];

  const emptyData = [{ name: 'Sem dados', value: 1 }];

  // Calcular novos registros no último período
  const newClients = clientCount > 0 ? 
    `${clientCount} cliente${clientCount > 1 ? 's' : ''} cadastrado${clientCount > 1 ? 's' : ''}` : 
    "Nenhum cliente cadastrado";
    
  const newProcesses = processCount > 0 ? 
    `${processCount} processo${processCount > 1 ? 's' : ''} cadastrado${processCount > 1 ? 's' : ''}` : 
    "Nenhum processo cadastrado";
    
  const newEvents = eventCount > 0 ? 
    `${eventCount} compromisso${eventCount > 1 ? 's' : ''} agendado${eventCount > 1 ? 's' : ''}` : 
    "Nenhum compromisso agendado";

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
                    <p className="text-3xl font-bold">{processCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{newProcesses}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Total de Clientes</h3>
                    <p className="text-3xl font-bold">{clientCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{newClients}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Compromissos Agendados</h3>
                    <p className="text-3xl font-bold">{eventCount}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{newEvents}</p>
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
                  <BarChart data={financialData.length > 0 ? financialData : emptyFinancialData}>
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
                        data={processData.length > 1 ? processData : emptyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(processData.length > 1 ? processData : emptyData).map((entry, index) => (
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
                        data={clientData.length > 1 ? clientData : emptyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(clientData.length > 1 ? clientData : emptyData).map((entry, index) => (
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
                        data={statusData.length > 1 ? statusData : emptyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(statusData.length > 1 ? statusData : emptyData).map((entry, index) => (
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
