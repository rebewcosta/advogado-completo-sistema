
import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLink from './NavLink';

interface DesktopNavProps {
  user: any;
  navItems: Array<{ path: string; label: string; icon: React.ReactNode }>;
  isActive: (path: string) => string;
  handleSignOut: () => Promise<void>;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ user, navItems, isActive, handleSignOut }) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {user ? (
        <>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              path={item.path}
              label={item.label}
              icon={item.icon}
              isActive={!!isActive(item.path)}
            />
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
  );
};

export default DesktopNav;
