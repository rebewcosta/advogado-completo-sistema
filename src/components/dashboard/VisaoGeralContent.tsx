
import React from 'react';
import StatsCards from './StatsCards';
import ProcessosContent from './ProcessosContent';
import PrazosContent from './PrazosContent';
import AgendaContent from './AgendaContent';

const VisaoGeralContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
        <StatsCards />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
          <PrazosContent />
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
          <AgendaContent />
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
        <ProcessosContent />
      </div>
    </div>
  );
};

export default VisaoGeralContent;
