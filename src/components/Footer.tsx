
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram as InstagramIcon } from 'lucide-react'; // Importando o ícone do Instagram

interface FooterProps {
  companyName?: string;
  address?: string;
  cnpj?: string;
  website?: string;
}

const Footer: React.FC<FooterProps> = ({ companyName, address, cnpj, website }) => {
  const hasCompanyInfo = companyName || address || cnpj || website;
  
  const contactInfo = [
    {
      icon: <Phone className="h-4 w-4 mr-2 text-lawyer-primary" />,
      text: "+55 (88) 9.9998-1618",
      href: "tel:+5588999981618",
    },
    {
      icon: <Mail className="h-4 w-4 mr-2 text-lawyer-primary" />,
      text: "suporte@sisjusgestao.com.br",
      href: "mailto:suporte@sisjusgestao.com.br",
    },
    {
      icon: <InstagramIcon className="h-4 w-4 mr-2 text-lawyer-primary" />,
      text: "@sisjusgestao",
      href: "https://www.instagram.com/sisjusgestao/",
      target: "_blank",
    },
  ];

  return (
    <footer className="bg-lawyer-dark text-white py-8 mt-auto w-full">
      <div className="container mx-auto px-4">
        {hasCompanyInfo ? (
          <div className="mb-6 text-center border-b border-gray-700 pb-4">
            <p className="text-lg font-semibold">{companyName || "JusGestão"}</p>
            {address && <p className="text-sm text-gray-300">{address}</p>}
            {cnpj && <p className="text-sm text-gray-300">CNPJ: {cnpj}</p>}
            {website && <p className="text-sm text-gray-300">Website: {website}</p>}
          </div>
        ) : null}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 md:w-1/3 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start">
              <img 
                src="/lovable-uploads/11a8e9cf-456c-4c4c-bd41-fac2efeaa537.png" 
                alt="JusGestão Logo" 
                className="h-8 w-auto mr-2" 
              />
              <span className="text-xl font-bold">
                <span className="text-lawyer-primary">Jus</span>Gestão
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-300 text-center md:text-left">
              Sistema completo para gerenciamento de escritórios de advocacia
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 md:w-2/3 w-full">
            <div className="text-left">
              <h3 className="text-lg font-medium mb-2">Recursos</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li><Link to="/dashboard" className="hover:text-lawyer-primary">Dashboard</Link></li>
                <li><Link to="/clientes" className="hover:text-lawyer-primary">Clientes</Link></li>
                <li><Link to="/meus-processos" className="hover:text-lawyer-primary">Processos</Link></li>
                <li><Link to="/agenda" className="hover:text-lawyer-primary">Agenda</Link></li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium mb-2">Legal</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li><Link to="/termos-privacidade" className="hover:text-lawyer-primary">Termos de Uso</Link></li>
                <li><Link to="/termos-privacidade" className="hover:text-lawyer-primary">Política de Privacidade</Link></li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium mb-2">Contato</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                {contactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-center hover:text-lawyer-primary transition-colors"
                      target={item.target || "_self"}
                      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                    >
                      {item.icon}
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} JusGestão. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
