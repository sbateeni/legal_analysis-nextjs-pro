import React from 'react';

interface ElegantSidebarFooterProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  darkMode: boolean;
}

const ElegantSidebarFooter: React.FC<ElegantSidebarFooterProps> = ({ isCollapsed, toggleCollapse, darkMode }) => {
  return (
    <div className="sidebar-footer">
      <button
        className="collapse-btn"
        onClick={toggleCollapse}
        title={isCollapsed ? 'إظهار القائمة' : 'طي القائمة'}
      >
        <span className="collapse-icon">
          {isCollapsed ? '→' : '←'}
        </span>
        {!isCollapsed && <span className="collapse-text">طي القائمة</span>}
      </button>
    </div>
  );
};

export default ElegantSidebarFooter;


