import React from 'react';
import { isMobile } from '@utils/crypto';

interface QuickActionsProps {
  theme: any;
  onFactualExtraction: () => void;
  onLegalBasis: () => void;
  onPleadingSkeleton: () => void;
  onAnalyticsInsights: () => void;
  onRiskAssessment: () => void;
  onStrategicAnalysis: () => void;
  onAutoAnalysis: () => void;
}

export default function QuickActions({
  theme,
  onFactualExtraction,
  onLegalBasis,
  onPleadingSkeleton,
  onAnalyticsInsights,
  onRiskAssessment,
  onStrategicAnalysis,
  onAutoAnalysis
}: QuickActionsProps) {
  const buttonStyle = (bgColor: string, textColor: string) => ({
    background: bgColor,
    border: `1px solid ${theme.border}`,
    color: textColor,
    borderRadius: 8,
    padding: '6px 10px',
    fontWeight: 700,
    cursor: 'pointer',
    width: isMobile() ? 'auto' : '100%'
  });

  return (
    <div style={{ 
      marginTop: isMobile() ? 0 : 12, 
      display: 'flex', 
      flexDirection: isMobile() ? 'row' : 'column', 
      gap: 8,
      flexWrap: isMobile() ? 'wrap' : 'nowrap'
    }}>
      <button 
        onClick={onFactualExtraction} 
        type="button" 
        style={buttonStyle('#eef2ff', '#4338ca')}
      >
        🧩 استخراج الوقائع
      </button>
      <button 
        onClick={onLegalBasis} 
        type="button" 
        style={buttonStyle('#ecfeff', '#0e7490')}
      >
        📚 أساس قانوني فلسطيني
      </button>
      <button 
        onClick={onPleadingSkeleton} 
        type="button" 
        style={buttonStyle('#f0fdf4', '#166534')}
      >
        📄 هيكل عريضة
      </button>
      <button 
        onClick={onAnalyticsInsights} 
        type="button" 
        style={buttonStyle('#f3e8ff', '#7c3aed')}
      >
        📊 رؤى تحليلية
      </button>
      <button 
        onClick={onRiskAssessment} 
        type="button" 
        style={buttonStyle('#fef2f2', '#dc2626')}
      >
        ⚠️ تقييم المخاطر
      </button>
      <button 
        onClick={onStrategicAnalysis} 
        type="button" 
        style={buttonStyle('#f0fdf4', '#059669')}
      >
        🎯 تحليل استراتيجي
      </button>
      <button 
        onClick={onAutoAnalysis} 
        type="button" 
        style={buttonStyle('#fef3c7', '#d97706')}
      >
        🚀 تحليل تلقائي
      </button>
    </div>
  );
}
