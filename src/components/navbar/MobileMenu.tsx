
import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavLink from './NavLink';

interface MobileMenuProps {
  user: any;
  isMenuOpen: boolean;
  navItems: Array<{ path: string; label: string; icon: React.ReactNode }>;
  isActive: (path: string) => string;
  handleSignOut: () => Promise<void>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  isMenuOpen,
  navItems,
  isActive,
  handleSignOut,
  setIsMenuOpen,
}) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-lawyer-dark border-t border-gray-700">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {user ? (
          <>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={!!isActive(item.path)}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
            
            {/* Admin link for authorized users in mobile menu - show only icon */}
            {user?.email === 'webercostag@gmail.com' && (
              <Link 
                to="/admin" 
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive('/admin')}`}
                onClick={() => setIsMenuOpen(false)}
                title="Admin"
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
  );
};

export default MobileMenu;
