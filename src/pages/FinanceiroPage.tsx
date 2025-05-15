
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  User,
  Calendar,
  X
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FinanceiroPage = () => {
  const [transactions, setTransactions] = useState<any[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const { toast } = useToast();
  
  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const receitas = transactions
    .filter(t => t.tipo === "Receita")
    .reduce((sum, t) => sum + t.valor, 0);
  
  const despesas = transactions
    .filter(t => t.tipo === "Despesa")
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saldo = receitas - despesas;

  const receitasPendentes = transactions
    .filter(t => t.tipo === "Receita" && t.status === "Pendente")
    .reduce((sum, t) => sum + t.valor, 0);

  const handleEditTransaction = (transaction: any) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      setTransactions(transactions.filter(transaction => transaction.id !== id));
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });
    }
  };

  const handleAddOrUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const transactionData = Object.fromEntries(formData.entries()) as any;
    transactionData.valor = parseFloat(transactionData.valor);
    
    if (currentTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(transaction => 
        transaction.id === currentTransaction.id ? {...transaction, ...transactionData, id: transaction.id} : transaction
      ));
      toast({
        title: "Transação atualizada",
        description: "Os dados da transação foram atualizados com sucesso.",
      });
    } else {
      // Add new transaction
      setTransactions([...transactions, {
        ...transactionData,
        id: Date.now() // Use timestamp for unique ID
      }]);
      toast({
        title: "Transação adicionada",
        description: "A nova transação foi adicionada com sucesso.",
      });
    }
    
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Controle Financeiro</h1>
              <p className="text-gray-600">Gerencie receitas, despesas e honorários</p>
            </div>
            <button 
              onClick={() => {
                setCurrentTransaction(null);
                setIsModalOpen(true);
              }} 
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-1" />
              Nova Transação
            </button>
          </div>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Receitas</h3>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo === "Receita").length
                } transações</span>
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Despesas</h3>
                <div className="bg-red-100 p-2 rounded-full">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo === "Despesa").length
                } transações</span>
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Saldo</h3>
                <div className={`p-2 rounded-full ${saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-2">Balanço atual</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">A Receber</h3>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{
                  transactions.filter(t => t.tipo === "Receita" && t.status === "Pendente").length
                } pendentes</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                  <Filter className="h-5 w-5" />
                  Filtrar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${
                            transaction.tipo === "Receita" ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.tipo === "Receita" ? 
                              <TrendingUp className="h-4 w-4 mr-1" /> : 
                              <TrendingDown className="h-4 w-4 mr-1" />
                            }
                            {transaction.tipo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.descricao}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          R$ {transaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.categoria}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(transaction.data).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.cliente || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{filteredTransactions.length}</span> de <span className="font-medium">{transactions.length}</span> transações
              </div>
              <div className="flex gap-2">
                <button className="p-2 border rounded-md hover:bg-gray-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 border rounded-md hover:bg-gray-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Modal para adicionar/editar transação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{currentTransaction ? 'Editar Transação' : 'Nova Transação'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddOrUpdateTransaction}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Transação</label>
                  <div className="flex">
                    <label className="inline-flex items-center mr-6">
                      <input 
                        type="radio" 
                        name="tipo" 
                        value="Receita" 
                        defaultChecked={currentTransaction?.tipo === "Receita" || !currentTransaction} 
                        className="mr-2" 
                      />
                      <span>Receita</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="tipo" 
                        value="Despesa" 
                        defaultChecked={currentTransaction?.tipo === "Despesa"} 
                        className="mr-2" 
                      />
                      <span>Despesa</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input 
                    type="text" 
                    id="descricao" 
                    name="descricao" 
                    defaultValue={currentTransaction?.descricao || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    id="valor" 
                    name="valor" 
                    min="0" 
                    step="0.01"
                    defaultValue={currentTransaction?.valor || ''}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select 
                      id="categoria" 
                      name="categoria" 
                      defaultValue={currentTransaction?.categoria || ''}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="Honorários">Honorários</option>
                      <option value="Consultas">Consultas</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Software">Software</option>
                      <option value="Salários">Salários</option>
                      <option value="Impostos">Impostos</option>
                      <option value="Suprimentos">Suprimentos</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input 
                      type="date" 
                      id="data" 
                      name="data" 
                      defaultValue={currentTransaction?.data || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      defaultValue={currentTransaction?.status || 'Pendente'}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input 
                      type="text" 
                      id="cliente" 
                      name="cliente" 
                      defaultValue={currentTransaction?.cliente || ''}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lawyer-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentTransaction(null);
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {currentTransaction ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default FinanceiroPage;
