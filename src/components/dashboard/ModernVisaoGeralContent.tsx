
import React from 'react';
import ModernStatsCards from './ModernStatsCards';
import ModernProcessosContent from './ModernProcessosContent';
import ModernPrazosContent from './ModernPrazosContent';
import ModernAgendaContent from './ModernAgendaContent';

const ModernVisaoGeralContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <ModernStatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ModernPrazosContent />
        </div>
        
        <div className="space-y-6">
          <ModernAgendaContent />
        </div>
      </div>

      <ModernProcessosContent />
    </div>
  );
};

export default ModernVisaoGeralContent;
