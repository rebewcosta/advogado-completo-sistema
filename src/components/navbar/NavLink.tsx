
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  path: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ path, label, icon, isActive, onClick, className = "" }) => {
  return (
    <Link
      to={path}
      className={`flex items-center px-2 py-2 rounded-md text-sm font-medium hover:bg-lawyer-primary/10 hover:text-lawyer-primary text-white ${
        isActive ? 'bg-lawyer-primary/10 text-lawyer-primary' : ''
      } ${className}`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </Link>
  );
};

export default NavLink;
