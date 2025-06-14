
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu,
  X
} from 'lucide-react';
import Logo from './navbar/Logo';
import DesktopNav from './navbar/DesktopNav';
import MobileMenu from './navbar/MobileMenu';
import { useUserRole } from '@/hooks/useUserRole';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-lawyer-primary/10 text-lawyer-primary' : '';
  };

  // Se estiver na página inicial ("/") e usuário logado, não mostrar os links de navegação
  const isHomePage = location.pathname === '/';
  const shouldShowNavItems = user && !isHomePage;

  // Define different navigation items based on authentication status and current page
  const navItems = shouldShowNavItems ? [
    // For authenticated users NOT on home page, show dashboard navigation
    { path: '/dashboard', label: 'Dashboard', icon: null },
    { path: '/meus-processos', label: 'Processos', icon: null },
    { path: '/clientes', label: 'Clientes', icon: null },
    { path: '/agenda', label: 'Agenda', icon: null },
  ] : [
    // For non-authenticated users or users on home page, show login/register
    ...(user ? [] : [
      { path: '/login', label: 'Login', icon: null },
      { path: '/cadastro', label: 'Cadastro', icon: null },
    ])
  ];

  return (
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
            isAdmin={isAdmin}
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
        isAdmin={isAdmin}
      />
    </nav>
  );
};

export default Navbar;
