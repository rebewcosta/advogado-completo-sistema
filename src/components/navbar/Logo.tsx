
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <div className="flex-shrink-0">
      <Link to="/" className="flex items-center gap-1">
        <img 
          src="/lovable-uploads/f43e275d-744e-43eb-a2c7-bbf3c17b3fc5.png" 
          alt="JusGestão Logo" 
          className="h-7 w-7" 
        />
        <div className="flex flex-col">
          <span className="text-lg font-bold">
            <span className="text-lawyer-primary">Jus</span>
            <span className="text-white">Gestão</span>
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Logo;
