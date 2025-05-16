
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
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
  );
};

export default Logo;
