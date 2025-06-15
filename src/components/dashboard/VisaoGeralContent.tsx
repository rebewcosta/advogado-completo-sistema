
import React from 'react';
import StatsCards from './StatsCards';
import ProcessosContent from './ProcessosContent';
import PrazosContent from './PrazosContent';
import AgendaContent from './AgendaContent';

const VisaoGeralContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PrazosContent />
        </div>
        
        <div className="space-y-6">
          <AgendaContent />
        </div>
      </div>

      <ProcessosContent />
    </div>
  );
};

export default VisaoGeralContent;
