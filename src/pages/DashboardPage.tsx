
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign,
  Search,
  Bell,
  Clock,
  CheckCircle,
  BarChart2,
  ChevronRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Mock data for dashboard
const mockFinancialData = [
  { month: 'Jan', receitas: 15000, despesas: 8000 },
  { month: 'Fev', receitas: 18000, despesas: 9500 },
  { month: 'Mar', receitas: 22000, despesas: 10000 },
  { month: 'Abr', receitas: 19500, despesas: 9800 },
  { month: 'Mai', receitas: 25000, despesas: 12000 },
  { month: 'Jun', receitas: 27000, despesas: 13500 },
];

const mockProcessTrend = [
  { month: 'Jan', ativos: 42, concluidos: 3 },
  { month: 'Fev', ativos: 45, concluidos: 5 },
  { month: 'Mar', ativos: 48, concluidos: 7 },
  { month: 'Abr', ativos: 51, concluidos: 4 },
  { month: 'Mai', ativos: 54, concluidos: 6 },
  { month: 'Jun', ativos: 56, concluidos: 8 },
];

// Mock data for upcoming events
const upcomingEvents = [
  { id: 1, title: "Audiência - João Silva", time: "14:00", date: "18/06/2025", type: "Audiência", cliente: "João Silva" },
  { id: 2, title: "Reunião com cliente", time: "09:30", date: "18/06/2025", type: "Reunião", cliente: "Maria Oliveira" },
  { id: 3, title: "Prazo final - Recurso", time: "18:00", date: "20/06/2025", type: "Prazo", cliente: "Empresa ABC Ltda" },
  { id: 4, title: "Depoimento testemunha", time: "10:00", date: "21/06/2025", type: "Audiência", cliente: "Roberto Costa" },
];

// Mock data for recent tasks
const recentTasks = [
  { id: 1, title: "Analisar petição inicial", status: "Pendente", priority: "Alta", dueDate: "17/06/2025" },
  { id: 2, title: "Preparar contestação", status: "Em andamento", priority: "Alta", dueDate: "19/06/2025" },
  { id: 3, title: "Revisar contrato", status: "Pendente", priority: "Média", dueDate: "20/06/2025" },
  { id: 4, title: "Enviar notificação extrajudicial", status: "Concluída", priority: "Alta", dueDate: "15/06/2025" },
  { id: 5, title: "Atualizar cadastro de cliente", status: "Concluída", priority: "Baixa", dueDate: "16/06/2025" },
];

const DashboardPage = () => {
  const { toast } = useToast();
  
  const handleToggleTaskStatus = (id: number) => {
    toast({
      title: "Status atualizado",
      description: "O status da tarefa foi atualizado com sucesso.",
    });
  };
  
  const getTaskStatusClass = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'text-red-600';
      case 'Média':
        return 'text-yellow-600';
      case 'Baixa':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo, Dr. Silva. Aqui está o resumo do seu escritório.</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lawyer-primary w-full md:w-auto"
                />
              </div>
              <button className="p-2 relative border rounded-lg hover:bg-gray-50">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Processos Ativos</p>
                <h3 className="text-3xl font-bold">56</h3>
                <p className="text-xs text-green-600 mt-1">+12% (mês anterior)</p>
              </div>
              <div className="bg-lawyer-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-lawyer-primary" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total de Clientes</p>
                <h3 className="text-3xl font-bold">187</h3>
                <p className="text-xs text-green-600 mt-1">+8 novos clientes</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Compromissos</p>
                <h3 className="text-3xl font-bold">23</h3>
                <p className="text-xs text-blue-600 mt-1">5 para hoje</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Faturamento Mensal</p>
                <h3 className="text-3xl font-bold">R$27.000</h3>
                <p className="text-xs text-green-600 mt-1">+8% (mês anterior)</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Receitas x Despesas</h3>
                <select className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-lawyer-primary">
                  <option value="6months">Últimos 6 meses</option>
                  <option value="year">Este ano</option>
                </select>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockFinancialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                    <Legend />
                    <Bar dataKey="receitas" name="Receitas" fill="#4CAF50" />
                    <Bar dataKey="despesas" name="Despesas" fill="#F44336" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Evolução de Processos</h3>
                <select className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-lawyer-primary">
                  <option value="6months">Últimos 6 meses</option>
                  <option value="year">Este ano</option>
                </select>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockProcessTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ativos" name="Processos Ativos" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="concluidos" name="Processos Concluídos" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Próximos Compromissos</h3>
                <a href="/agenda" className="text-sm text-lawyer-primary hover:underline flex items-center">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 hover:shadow-sm">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-full
                          ${event.type === 'Audiência' ? 'bg-blue-100 text-blue-600' : 
                            event.type === 'Prazo' ? 'bg-red-100 text-red-600' : 
                            'bg-green-100 text-green-600'}
                        `}>
                          {event.type === 'Audiência' ? 
                            <Users className="h-5 w-5" /> : 
                            event.type === 'Prazo' ? 
                              <Clock className="h-5 w-5" /> :
                              <Calendar className="h-5 w-5" />
                          }
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.cliente}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{event.date}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Suas Tarefas</h3>
                <a href="#" className="text-sm text-lawyer-primary hover:underline flex items-center">
                  Ver todas <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="space-y-3">
                {recentTasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-3 hover:shadow-sm">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            task.status === 'Concluída' 
                              ? 'bg-green-100 text-green-600' 
                              : 'border border-gray-300 hover:border-lawyer-primary'
                          }`}
                        >
                          {task.status === 'Concluída' && <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className={`font-medium ${task.status === 'Concluída' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getTaskStatusClass(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`text-xs px-0 py-1 ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs px-0 py-1 text-gray-500 ml-auto">
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                + Nova tarefa
              </button>
            </div>
          </div>
          
          {/* Quick Access */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="font-semibold mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <a href="/clientes" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-lawyer-primary mb-2" />
                <span className="text-sm">Clientes</span>
              </a>
              <a href="/processos" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm">Processos</span>
              </a>
              <a href="/agenda" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm">Agenda</span>
              </a>
              <a href="/financeiro" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm">Financeiro</span>
              </a>
              <a href="/documentos" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm">Documentos</span>
              </a>
              <a href="/relatorios" className="p-4 border rounded-lg hover:shadow-md flex flex-col items-center text-center">
                <BarChart2 className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm">Relatórios</span>
              </a>
            </div>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
