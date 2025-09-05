import React from 'react';
import { AnalyticsData } from './types';
import { isMobile } from '@utils/crypto';

interface AnalyticsPanelProps {
  analytics: AnalyticsData;
  theme: any;
}

export default function AnalyticsPanel({ analytics, theme }: AnalyticsPanelProps) {
  return (
    <div className="card-ui" style={{ 
      background: theme.card, 
      borderColor: theme.border, 
      padding: isMobile() ? 12 : 16, 
      marginBottom: 16 
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span>📊</span>
        <b style={{ color: theme.accent2 }}>التحليلات والإحصائيات</b>
      </div>
      
      {/* ملخص سريع */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem' }}>📈 ملخص سريع</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile() ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.totalCases}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>إجمالي القضايا</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.successRate}%</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>معدل النجاح</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.averageStagesCompleted}%</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>متوسط الإنجاز</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.averageCaseLength}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>متوسط الطول</div>
          </div>
        </div>
      </div>

      {/* التحليل التنبؤي */}
      {analytics.predictiveAnalyses && analytics.predictiveAnalyses.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: theme.text, margin: '0 0 0.75rem 0', fontSize: '1rem' }}>
            🔮 التحليل التنبؤي للقضايا
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.75rem'
          }}>
            {analytics.predictiveAnalyses.slice(0, 4).map((analysis) => (
              <div key={analysis.caseId} style={{
                background: theme.resultBg,
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${theme.border}`,
                transition: 'transform 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{
                      color: theme.text,
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}>
                      {analysis.caseName}
                    </h5>
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{
                        padding: '0.2rem 0.4rem',
                        borderRadius: '0.2rem',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        background: analysis.successProbability >= 70 ? '#10b981' : 
                                   analysis.successProbability >= 40 ? '#f59e0b' : '#ef4444'
                      }}>
                        {analysis.successProbability.toFixed(0)}% نجاح
                      </span>
                      <span style={{
                        padding: '0.2rem 0.4rem',
                        borderRadius: '0.2rem',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        background: analysis.riskLevel === 'low' ? '#10b981' : 
                                   analysis.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'
                      }}>
                        مخاطر {analysis.riskLevel === 'low' ? 'منخفضة' : 
                               analysis.riskLevel === 'medium' ? 'متوسطة' : 'عالية'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '0.4rem',
                  background: theme.border,
                  borderRadius: '0.2rem',
                  marginBottom: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${analysis.successProbability}%`,
                    height: '100%',
                    background: analysis.successProbability >= 70 ? '#10b981' : 
                               analysis.successProbability >= 40 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {/* Recommendations */}
                <div style={{
                  background: theme.card,
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: `1px solid ${theme.border}`
                }}>
                  <h6 style={{
                    color: theme.text,
                    margin: '0 0 0.25rem 0',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    التوصيات
                  </h6>
                  <ul style={{
                    color: theme.text,
                    margin: '0',
                    padding: '0 0 0 0.75rem',
                    fontSize: '0.65rem',
                    opacity: 0.8
                  }}>
                    {analysis.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                {/* Additional Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem',
                  fontSize: '0.6rem',
                  color: theme.text,
                  opacity: 0.6
                }}>
                  <span>المدة: {analysis.estimatedDuration}</span>
                  <span>التعقيد: {analysis.complexityScore.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* أنواع القضايا */}
      {Object.keys(analytics.casesByType).length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: theme.text, margin: '0 0 0.75rem 0', fontSize: '1rem' }}>أنواع القضايا</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.5rem'
          }}>
            {Object.entries(analytics.casesByType).map(([type, count]) => (
              <div key={type} style={{
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                textAlign: 'center',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ fontWeight: 'bold', color: theme.text, marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  {type}
                </div>
                <div style={{ fontSize: '1.25rem', color: theme.accent2, fontWeight: 'bold' }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المراحل الأكثر استخداماً */}
      {analytics.topStages.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: theme.text, margin: '0 0 0.75rem 0', fontSize: '1rem' }}>المراحل الأكثر استخداماً</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {analytics.topStages.map(({ stage, count }) => (
              <div key={stage} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                background: theme.resultBg,
                borderRadius: '0.4rem',
                border: `1px solid ${theme.border}`
              }}>
                <span style={{ fontWeight: '500', color: theme.text, fontSize: '0.8rem' }}>{stage}</span>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold',
                  color: theme.accent2
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* المشاكل الشائعة */}
      {analytics.mostCommonIssues.length > 0 && (
        <div>
          <h4 style={{ color: theme.text, margin: '0 0 0.75rem 0', fontSize: '1rem' }}>المشاكل الشائعة</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {analytics.mostCommonIssues.map((issue, index) => (
              <div key={index} style={{
                padding: '0.5rem',
                background: '#fef3c7',
                borderRadius: '0.4rem',
                borderLeft: '3px solid #f59e0b',
                fontSize: '0.8rem'
              }}>
                <span style={{ color: '#92400e' }}>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
