
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContaCancelada from '@/components/assinatura/ContaCancelada';

const ContaCanceladaPage = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate('/');
  };

  return (
    <ContaCancelada onVoltar={handleVoltar} />
  );
};

export default ContaCanceladaPage;
