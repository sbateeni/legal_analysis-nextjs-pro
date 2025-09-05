import React from 'react';
import { getPalestinianLegalColors } from './PalestinianLegalTheme';
import LegalCard from './LegalCard';

export interface LegalStatsProps {
  darkMode?: boolean;
  stats: {
    casesAnalyzed: number;
    users: number;
    stagesCompleted: number;
    satisfactionRate: number;
  };
}

const LegalStats: React.FC<LegalStatsProps> = ({ darkMode = false, stats }) => {
  const colors = getPalestinianLegalColors(darkMode);

  const statsData = [
    {
      value: stats.casesAnalyzed.toLocaleString(),
      label: 'قضية محللة',
      icon: '⚖️',
      color: colors.palestineGreen,
      variant: 'secondary' as const
    },
    {
      value: stats.users.toLocaleString(),
      label: 'مستخدم نشط',
      icon: '👥',
      color: colors.legalGold,
      variant: 'accent' as const
    },
    {
      value: stats.stagesCompleted.toLocaleString(),
      label: 'مرحلة مكتملة',
      icon: '📊',
      color: colors.primary,
      variant: 'primary' as const
    },
    {
      value: `${stats.satisfactionRate}%`,
      label: 'معدل الرضا',
      icon: '⭐',
      color: colors.palestineRed,
      variant: 'accent' as const
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      padding: '0 16px'
    }}>
      {statsData.map((stat, index) => (
        <LegalCard
          key={index}
          variant={stat.variant}
          size="lg"
          hoverable
          darkMode={darkMode}
          borderColor={stat.color}
          icon={
            <div style={{
              fontSize: '2.5rem',
              color: stat.color,
              textShadow: darkMode 
                ? `0 0 10px ${stat.color}33` 
                : `0 2px 4px ${stat.color}22`
            }}>
              {stat.icon}
            </div>
          }
        >
          <div style={{ textAlign: 'center' }}>
            {/* Stable Number Display - No Gradients */}
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: stat.color,
              marginBottom: '12px',
              fontFamily: "'Amiri', 'Times New Roman', serif",
              textShadow: darkMode 
                ? `0 0 20px ${stat.color}33` 
                : `0 2px 8px ${stat.color}22`,
              letterSpacing: '-0.02em'
            }}>
              {stat.value}
            </div>

            {/* Stable Label Text */}
            <div style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: colors.secondaryText,
              fontFamily: "'Tajawal', sans-serif",
              letterSpacing: '0.02em'
            }}>
              {stat.label}
            </div>
          </div>
        </LegalCard>
      ))}
    </div>
  );
};

export default LegalStats;