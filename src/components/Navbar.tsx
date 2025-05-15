
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  BarChart2, 
  Archive,
  Home,
  Search,
  Bell,
  User
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  return (
    <nav className="bg-lawyer-dark text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="text-lawyer-accent">Jus</span>Gestão
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-lawyer-accent transition-colors">Início</Link>
          <Link to="/clientes" className="hover:text-lawyer-accent transition-colors">Clientes</Link>
          <Link to="/processos" className="hover:text-lawyer-accent transition-colors">Processos</Link>
          <Link to="/agenda" className="hover:text-lawyer-accent transition-colors">Agenda</Link>
          <Link to="/financeiro" className="hover:text-lawyer-accent transition-colors">Financeiro</Link>
          <Link to="/documentos" className="hover:text-lawyer-accent transition-colors">Documentos</Link>
          <Link to="/relatorios" className="hover:text-lawyer-accent transition-colors">Relatórios</Link>
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 hover:bg-lawyer-primary/20 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button className="p-2 hover:bg-lawyer-primary/20 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lawyer-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="font-medium">Dr. Silva</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 hover:bg-lawyer-primary/20 rounded-full transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in bg-lawyer-dark absolute top-16 left-0 right-0 z-50 shadow-lg">
          <div className="container mx-auto py-4 space-y-3 px-4">
            <Link to="/" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <Home className="w-5 h-5" />
              <span>Início</span>
            </Link>
            <Link to="/clientes" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <Users className="w-5 h-5" />
              <span>Clientes</span>
            </Link>
            <Link to="/processos" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <FileText className="w-5 h-5" />
              <span>Processos</span>
            </Link>
            <Link to="/agenda" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <Calendar className="w-5 h-5" />
              <span>Agenda</span>
            </Link>
            <Link to="/financeiro" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <DollarSign className="w-5 h-5" />
              <span>Financeiro</span>
            </Link>
            <Link to="/documentos" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <Archive className="w-5 h-5" />
              <span>Documentos</span>
            </Link>
            <Link to="/relatorios" className="flex items-center gap-2 py-2 hover:bg-lawyer-primary/20 rounded-lg px-3">
              <BarChart2 className="w-5 h-5" />
              <span>Relatórios</span>
            </Link>
            <div className="pt-2 border-t border-white/10 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-lawyer-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">Dr. Silva</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
