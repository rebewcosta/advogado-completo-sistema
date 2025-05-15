
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
  LogOut,
  User
} from 'lucide-react';

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

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/clientes', label: 'Clientes', icon: <Users className="h-5 w-5" /> },
    { path: '/processos', label: 'Processos', icon: <FileText className="h-5 w-5" /> },
    { path: '/agenda', label: 'Agenda', icon: <Calendar className="h-5 w-5" /> },
    { path: '/financeiro', label: 'Financeiro', icon: <DollarSign className="h-5 w-5" /> },
    { path: '/documentos', label: 'Documentos', icon: <FileBox className="h-5 w-5" /> },
    { path: '/relatorios', label: 'Relatórios', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/configuracoes', label: 'Configurações', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-lawyer-dark shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" 
                alt="JusGestão Logo" 
                className="h-8 w-8" 
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold">
                  <span className="text-lawyer-primary">Jus</span>
                  <span className="text-white">Gestão</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive(item.path)}`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
                
                {/* Admin link for authorized users */}
                {user?.email === 'webercostag@gmail.com' && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive('/admin')}`}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="ml-2">Admin</span>
                  </Link>
                )}

                <div className="ml-4 flex items-center">
                  <Link to="/perfil" className="flex items-center text-white hover:text-lawyer-primary">
                    <User className="h-5 w-5" />
                    <span className="ml-1">Perfil</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="ml-4 flex items-center text-white hover:text-lawyer-primary"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="ml-1">Sair</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-lawyer-primary px-3 py-2">
                  Login
                </Link>
                <Link to="/cadastro" className="bg-lawyer-primary text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Cadastre-se
                </Link>
              </>
            )}
          </div>

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
      {isMenuOpen && (
        <div className="md:hidden bg-lawyer-dark border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive(item.path)}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
                
                {/* Admin link for authorized users in mobile menu */}
                {user?.email === 'webercostag@gmail.com' && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive('/admin')}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span className="ml-2">Admin</span>
                  </Link>
                )}

                <Link
                  to="/perfil"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span className="ml-2">Perfil</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-2">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-lawyer-primary/10 hover:text-lawyer-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/cadastro"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-lawyer-primary text-white hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
