import React from 'react';
import type { LegalCase } from '@utils/db';
import { AnalyticsData } from './types';
import { isMobile } from '@utils/crypto';
import QuickActions from './QuickActions';

interface SidebarProps {
  theme: any;
  selectedCaseId: string;
  cases: LegalCase[];
  analytics: AnalyticsData | null;
  onFactualExtraction: () => void;
  onLegalBasis: () => void;
  onPleadingSkeleton: () => void;
  onAnalyticsInsights: () => void;
  onRiskAssessment: () => void;
  onStrategicAnalysis: () => void;
  onAutoAnalysis: () => void;
}

export default function Sidebar({
  theme,
  selectedCaseId,
  cases,
  analytics,
  onFactualExtraction,
  onLegalBasis,
  onPleadingSkeleton,
  onAnalyticsInsights,
  onRiskAssessment,
  onStrategicAnalysis,
  onAutoAnalysis
}: SidebarProps) {
  return (
    <aside className="card-ui" style={{ 
      background: theme.card, 
      borderColor: theme.border, 
      padding: isMobile() ? 12 : 16, 
      height: '100%', 
      alignSelf: 'start' 
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span>🗂️</span>
        <b style={{ 
          color: theme.accent2,
          textShadow: '0 0 0.5px currentColor'
        }}>سياق القضية</b>
      </div>
      
      {selectedCaseId ? (
        <>
          <div style={{ 
            fontWeight: 700, 
            marginBottom: 6,
            textShadow: '0 0 0.5px currentColor'
          }}>
            {cases.find(c => c.id === selectedCaseId)?.name}
          </div>
          <div style={{ 
            fontSize: 13, 
            color: theme.textSecondary || '#6b7280', 
            marginBottom: 10,
            textShadow: '0 0 0.8px currentColor'
          }}>
            مراحل مكتملة: {cases.find(c => c.id === selectedCaseId)?.stages.length || 0}
          </div>
          <div style={{ 
            fontSize: 13, 
            marginBottom: 8, 
            color: theme.accent2,
            textShadow: '0 0 0.5px currentColor'
          }}>آخر 3 مراحل:</div>
          <ul style={{ margin: 0, paddingRight: 16 }}>
            {([...((cases.find(c => c.id === selectedCaseId)?.stages) || [])]
              .sort((a, b) => b.stageIndex - a.stageIndex)
              .slice(0, 3)
              .map(s => (
                <li key={s.id} style={{ marginBottom: 6 }}>
                  <b>{s.stage}</b>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    {(s.output || '').slice(0, 80)}...
                  </div>
                </li>
              )))}
          </ul>
        </>
      ) : (
        <div style={{ fontSize: 13, color:'#6b7280' }}>اختر قضية لعرض السياق هنا</div>
      )}

      {/* إحصائيات سريعة */}
      {analytics && (
        <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, border: `1px solid ${theme.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span>📊</span>
            <b style={{ color: theme.accent2, fontSize: 13 }}>إحصائيات سريعة</b>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: theme.accent2, fontSize: 16 }}>{analytics.totalCases}</div>
              <div style={{ color: '#6b7280' }}>إجمالي القضايا</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: 16 }}>{analytics.successRate}%</div>
              <div style={{ color: '#6b7280' }}>معدل النجاح</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: 16 }}>{analytics.averageStagesCompleted}%</div>
              <div style={{ color: '#6b7280' }}>متوسط الإنجاز</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', color: theme.accent, fontSize: 16 }}>{analytics.averageCaseLength}</div>
              <div style={{ color: '#6b7280' }}>متوسط الطول</div>
            </div>
          </div>
        </div>
      )}

      {/* التحليل التنبؤي للقضية المختارة */}
      {selectedCaseId && analytics && analytics.predictiveAnalyses && (
        (() => {
          const selectedAnalysis = analytics.predictiveAnalyses.find(a => a.caseId === selectedCaseId);
          return selectedAnalysis ? (
            <div style={{ marginTop: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: `1px solid #0ea5e9` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span>🔮</span>
                <b style={{ color: '#0c4a6e', fontSize: 13 }}>التحليل التنبؤي</b>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#0c4a6e' }}>احتمالية النجاح:</span>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 'bold',
                    color: selectedAnalysis.successProbability >= 70 ? '#10b981' : 
                           selectedAnalysis.successProbability >= 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {selectedAnalysis.successProbability.toFixed(0)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${selectedAnalysis.successProbability}%`,
                    height: '100%',
                    background: selectedAnalysis.successProbability >= 70 ? '#10b981' : 
                               selectedAnalysis.successProbability >= 40 ? '#f59e0b' : '#ef4444',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#0c4a6e' }}>مستوى المخاطر:</span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: selectedAnalysis.riskLevel === 'low' ? '#10b981' : 
                             selectedAnalysis.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'
                }}>
                  {selectedAnalysis.riskLevel === 'low' ? 'منخفضة' : 
                   selectedAnalysis.riskLevel === 'medium' ? 'متوسطة' : 'عالية'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>
                المدة المتوقعة: {selectedAnalysis.estimatedDuration}
              </div>
              <div style={{ fontSize: 11, color: '#0c4a6e' }}>
                درجة التعقيد: {selectedAnalysis.complexityScore.toFixed(0)}%
              </div>
            </div>
          ) : null;
        })()
      )}
      
      {/* Quick Actions (Desktop only) */}
      {!isMobile() && (
        <QuickActions
          theme={theme}
          onFactualExtraction={onFactualExtraction}
          onLegalBasis={onLegalBasis}
          onPleadingSkeleton={onPleadingSkeleton}
          onAnalyticsInsights={onAnalyticsInsights}
          onRiskAssessment={onRiskAssessment}
          onStrategicAnalysis={onStrategicAnalysis}
          onAutoAnalysis={onAutoAnalysis}
        />
      )}
    </aside>
  );
}
