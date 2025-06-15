
import React from 'react';
import StatsCards from './StatsCards';
import ProcessosContent from './ProcessosContent';
import AgendaContent from './AgendaContent';
import FinanceiroContent from './FinanceiroContent';
import PrazosContent from './PrazosContent';

const VisaoGeralContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessosContent />
        <PrazosContent />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgendaContent />
        <FinanceiroContent />
      </div>
    </div>
  );
};

export default VisaoGeralContent;
