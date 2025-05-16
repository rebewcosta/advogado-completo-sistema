
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <div className="flex-shrink-0">
      <Link to="/" className="flex items-center gap-1">
        <img 
          src="/lovable-uploads/b847f8b8-3af4-4dc2-9e6c-84c18116e7cf.png" 
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
