
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  FileBox, 
  BarChart2, 
  Settings,
  Menu,
  X,
  Shield,
  ListChecks,
  BookOpen
} from 'lucide-react';
import Logo from './navbar/Logo';
import DesktopNav from './navbar/DesktopNav';
import MobileMenu from './navbar/MobileMenu';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-lawyer-primary/10 text-lawyer-primary' : '';
  };

  // Definindo navItems aqui para passar para DesktopNav e MobileMenu
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/meus-processos', label: 'Meus Processos', icon: <FileText className="h-5 w-5" /> },
    { path: '/clientes', label: 'Clientes', icon: <Users className="h-5 w-5" /> },
    { path: '/agenda', label: 'Agenda', icon: <Calendar className="h-5 w-5" /> },
    { path: '/tarefas', label: 'Tarefas', icon: <ListChecks className="h-5 w-5" /> },
    { path: '/publicacoes', label: 'Publicações', icon: <BookOpen className="h-5 w-5" /> },
    { path: '/financeiro', label: 'Financeiro', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/documentos', label: 'Documentos', icon: <FileBox className="h-5 w-5" /> },
    { path: '/relatorios', label: 'Relatórios', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/configuracoes', label: 'Configurações', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      <nav className="bg-lawyer-dark shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <DesktopNav 
              user={user}
              navItems={navItems}
              isActive={isActive}
              handleSignOut={handleSignOut}
            />

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-lawyer-primary hover:bg-gray-700 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu 
          user={user}
          isMenuOpen={isMenuOpen}
          navItems={navItems}
          isActive={isActive}
          handleSignOut={handleSignOut}
          setIsMenuOpen={setIsMenuOpen}
        />
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
