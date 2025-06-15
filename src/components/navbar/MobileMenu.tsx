
import React from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavLink from './NavLink';

interface MobileMenuProps {
  user: any;
  isMenuOpen: boolean;
  navItems: Array<{ path: string; label: string; icon: React.ReactNode }>;
  isActive: (path: string) => string;
  handleSignOut: () => Promise<void>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAdmin?: () => boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  user,
  isMenuOpen,
  navItems,
  isActive,
  handleSignOut,
  setIsMenuOpen,
  isAdmin,
}) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-lawyer-dark border-t border-gray-700 safe-area-inset-bottom">
      <div className="px-3 sm:px-4 pt-3 pb-4 space-y-2">
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
            
            {/* Admin link APENAS para webercostag@gmail.com */}
            {user.email === 'webercostag@gmail.com' && (
              <Link 
                to="/admin" 
                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white transition-colors ${isActive('/admin')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-5 w-5" />
                <span className="ml-3">Admin</span>
              </Link>
            )}

            <button
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Sair</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-lawyer-primary/10 hover:text-lawyer-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/cadastro"
              className="block px-4 py-3 rounded-lg text-base font-medium bg-lawyer-primary text-white hover:bg-blue-700 transition-colors"
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
