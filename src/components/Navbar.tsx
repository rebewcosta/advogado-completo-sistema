
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

  // Definindo navItems apenas para páginas públicas
  const navItems = [
    { path: '/login', label: 'Login', icon: null },
    { path: '/cadastro', label: 'Cadastro', icon: null },
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
  );
};

export default Navbar;
