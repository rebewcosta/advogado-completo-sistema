
import React from 'react';
import { LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLink from './NavLink';

interface DesktopNavProps {
  user: any;
  navItems: Array<{ path: string; label: string; icon: React.ReactNode }>;
  isActive: (path: string) => string;
  handleSignOut: () => Promise<void>;
  isAdmin?: () => boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ user, navItems, isActive, handleSignOut, isAdmin }) => {
  return (
    <div className="hidden md:flex items-center space-x-3">
      {user ? (
        <>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              isActive={!!isActive(item.path)}
              className="text-xs"
            />
          ))}
          
          {/* Admin link APENAS para webercostag@gmail.com */}
          {user.email === 'webercostag@gmail.com' && (
            <Link 
              to="/admin" 
              className={`flex items-center px-2 py-2 rounded-md text-sm font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${isActive('/admin')}`}
              title="Admin"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )}

          <div className="ml-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center text-white hover:text-lawyer-primary text-xs"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-1">Sair</span>
            </Button>
          </div>
        </>
      ) : (
        <>
          <Link to="/login" className="text-white hover:text-lawyer-primary px-2 py-2 text-xs">
            Login
          </Link>
          <Link to="/cadastro" className="bg-lawyer-primary text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-xs">
            Cadastre-se
          </Link>
        </>
      )}
    </div>
  );
};

export default DesktopNav;
