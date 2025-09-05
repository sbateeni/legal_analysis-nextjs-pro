import React from 'react';

interface ElegantSidebarHeaderProps {
  isCollapsed: boolean;
  textColor: string;
}

const ElegantSidebarHeader: React.FC<ElegantSidebarHeaderProps> = ({ isCollapsed, textColor }) => {
  return (
    <div className="sidebar-header">
      {!isCollapsed && (
        <div className="sidebar-logo">
          <span className="logo-icon">⚖️</span>
          <span className="logo-text" style={{ color: textColor }}>التحليل القانوني</span>
        </div>
      )}
      {isCollapsed && (
        <div className="sidebar-logo-collapsed">
          <span className="logo-icon">⚖️</span>
        </div>
      )}
    </div>
  );
};

export default ElegantSidebarHeader;


