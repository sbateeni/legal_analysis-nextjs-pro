/**
 * مكونات واجهة المستخدم للمعالجة المتوازية
 * Parallel Processing UI Components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DetailedProgress, 
  ProgressAlert, 
  StageProgressDetail,
  ResourceMetrics 
} from '../utils/parallel';

interface ParallelProgressViewProps {
  progress: DetailedProgress;
  onPauseResume?: () => void;
  onStop?: () => void;
  onDismissAlert?: (alertId: string) => void;
  theme: any;
  isMobile: boolean;
}

/**
 * عارض التقدم المتوازي المتقدم
 */
export const ParallelProgressView: React.FC<ParallelProgressViewProps> = ({
  progress,
  onPauseResume,
  onStop,
  onDismissAlert,
  theme,
  isMobile
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showAlerts, setShowAlerts] = useState(true);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}س ${minutes % 60}د ${seconds % 60}ث`;
    } else if (minutes > 0) {
      return `${minutes}د ${seconds % 60}ث`;
    } else {
      return `${seconds}ث`;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return '#10b981';
      case 'good': return '#059669';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return theme.text;
    }
  };

  return (
    <div style={{
      background: theme.card,
      borderRadius: 16,
      boxShadow: `0 4px 20px ${theme.shadow}`,
      border: `2px solid ${theme.accent}`,
      overflow: 'hidden'
    }}>
      {/* رأس المعلومات العامة */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
        color: '#fff',
        padding: isMobile ? 16 : 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 24,
            height: 24,
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div>
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 'bold' }}>
              المعالجة المتوازية الذكية
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              المرحلة {progress.currentPhase + 1} من {progress.totalPhases}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {onPauseResume && (
            <button
              onClick={onPauseResume}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              ⏸️ إيقاف مؤقت
            </button>
          )}
          {onStop && (
            <button
              onClick={onStop}
              style={{
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              ⏹️ إيقاف
            </button>
          )}
        </div>
      </div>

      {/* شريط التقدم الرئيسي */}
      <div style={{ padding: isMobile ? 16 : 20 }}>
        <div style={{
          background: '#e5e7eb',
          height: 20,
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative'
        }}>
          <div style={{
            width: `${progress.progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${theme.accent2}, ${theme.accent})`,
            transition: 'width 0.5s ease',
            borderRadius: 10
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 12,
            fontWeight: 'bold',
            color: progress.progress > 50 ? '#fff' : theme.text
          }}>
            {progress.progress.toFixed(1)}%
          </div>
        </div>

        {/* المقاييس السريعة */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: theme.accent }}>
              {progress.efficiency.toFixed(1)}%
            </div>
            <div style={{ fontSize: 12, color: theme.text, opacity: 0.7 }}>
              الكفاءة
            </div>
          </div>
          
          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>
              {progress.completedStages.length}
            </div>
            <div style={{ fontSize: 12, color: theme.text, opacity: 0.7 }}>
              مكتمل
            </div>
          </div>

          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }}>
              {progress.runningStages.length}
            </div>
            <div style={{ fontSize: 12, color: theme.text, opacity: 0.7 }}>
              قيد التشغيل
            </div>
          </div>

          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: progress.failedStages.length > 0 ? '#ef4444' : '#6b7280' }}>
              {progress.failedStages.length}
            </div>
            <div style={{ fontSize: 12, color: theme.text, opacity: 0.7 }}>
              فاشل
            </div>
          </div>
        </div>

        {/* التنبيهات */}
        {showAlerts && progress.alerts && progress.alerts.length > 0 && (
          <AlertsSection 
            alerts={progress.alerts}
            onDismiss={onDismissAlert}
            onToggleSection={() => setShowAlerts(!showAlerts)}
            theme={theme}
            isMobile={isMobile}
          />
        )}

        {/* الأقسام القابلة للطي */}
        <div style={{ marginTop: 20 }}>
          {/* نظرة عامة */}
          <CollapsibleSection
            title="📊 نظرة عامة"
            isExpanded={expandedSections.has('overview')}
            onToggle={() => toggleSection('overview')}
            theme={theme}
          >
            <OverviewSection 
              progress={progress}
              theme={theme}
              isMobile={isMobile}
              formatTime={formatTime}
            />
          </CollapsibleSection>

          {/* تفاصيل المراحل */}
          <CollapsibleSection
            title="🔍 تفاصيل المراحل"
            isExpanded={expandedSections.has('stages')}
            onToggle={() => toggleSection('stages')}
            theme={theme}
          >
            <StagesSection 
              stageDetails={progress.stageDetails}
              theme={theme}
              isMobile={isMobile}
            />
          </CollapsibleSection>

          {/* الاتجاهات والتحليلات */}
          <CollapsibleSection
            title="📈 الاتجاهات والتحليلات"
            isExpanded={expandedSections.has('trends')}
            onToggle={() => toggleSection('trends')}
            theme={theme}
          >
            <TrendsSection 
              trends={progress.trends}
              metrics={progress.metrics}
              theme={theme}
              isMobile={isMobile}
            />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

/**
 * قسم التنبيهات
 */
const AlertsSection: React.FC<{
  alerts: ProgressAlert[];
  onDismiss?: (alertId: string) => void;
  onToggleSection: () => void;
  theme: any;
  isMobile: boolean;
}> = ({ alerts, onDismiss, theme, isMobile }) => {
  const alertTypeIcons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const alertTypeColors: Record<string, string> = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  };

  return (
    <div style={{
      background: theme.resultBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <h4 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.text
        }}>
          🔔 التنبيهات ({alerts.length})
        </h4>
      </div>

      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{
            background: `${alertTypeColors[alert.type]}15`,
            border: `1px solid ${alertTypeColors[alert.type]}30`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}>
            <span style={{ fontSize: 16 }}>{alertTypeIcons[alert.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 'bold',
                color: alertTypeColors[alert.type],
                fontSize: 13,
                marginBottom: 4
              }}>
                {alert.title}
              </div>
              <div style={{
                fontSize: 12,
                color: theme.text,
                lineHeight: 1.4
              }}>
                {alert.message}
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.text,
                  opacity: 0.5,
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * قسم قابل للطي
 */
const CollapsibleSection: React.FC<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: any;
}> = ({ title, isExpanded, onToggle, children, theme }) => {
  return (
    <div style={{
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          background: theme.resultBg,
          border: 'none',
          padding: 16,
          textAlign: 'right',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 14,
          fontWeight: 'bold',
          color: theme.text
        }}
      >
        <span>{title}</span>
        <span style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div style={{
          padding: 16,
          background: theme.card,
          borderTop: `1px solid ${theme.border}`
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * قسم النظرة العامة
 */
const OverviewSection: React.FC<{
  progress: DetailedProgress;
  theme: any;
  isMobile: boolean;
  formatTime: (ms: number) => string;
}> = ({ progress, theme, isMobile, formatTime }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16
    }}>
      <div>
        <h5 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: 13 }}>
          ⏱️ التوقيت
        </h5>
        <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.8 }}>
          <div>وقت البدء: {new Date(progress.metrics.startTime).toLocaleTimeString('ar-SA')}</div>
          <div>الوقت المنقضي: {formatTime(progress.metrics.elapsedTime)}</div>
          <div>الوقت المتبقي: {formatTime(progress.metrics.remainingTime)}</div>
          <div>الوقت المقدر الكلي: {formatTime(progress.metrics.estimatedTotalTime)}</div>
        </div>
      </div>

      <div>
        <h5 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: 13 }}>
          📊 الأداء
        </h5>
        <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.8 }}>
          <div>متوسط وقت المرحلة: {formatTime(progress.metrics.averageStageTime)}</div>
          <div>الإنتاجية: {progress.metrics.throughput.toFixed(1)} مرحلة/دقيقة</div>
          <div>معدل النجاح: {progress.metrics.successRate.toFixed(1)}%</div>
          <div>خيوط نشطة: {progress.activeThreads}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * قسم المراحل
 */
const StagesSection: React.FC<{
  stageDetails: Map<number, StageProgressDetail>;
  theme: any;
  isMobile: boolean;
}> = ({ stageDetails, theme, isMobile }) => {
  const stages = Array.from(stageDetails.values()).sort((a, b) => a.stageIndex - b.stageIndex);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'running': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'pending': return '#6b7280';
      default: return theme.text;
    }
  };

  return (
    <div style={{
      maxHeight: 300,
      overflowY: 'auto'
    }}>
      {stages.map(stage => (
        <div key={stage.stageIndex} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          marginBottom: 8,
          background: theme.resultBg,
          borderRadius: 8,
          border: `1px solid ${theme.border}`
        }}>
          <span style={{ fontSize: 16 }}>{getStatusIcon(stage.status)}</span>
          
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: theme.text,
              marginBottom: 4
            }}>
              {stage.stageName || `المرحلة ${stage.stageIndex + 1}`}
            </div>
            
            {stage.status === 'running' && (
              <div style={{
                background: '#e5e7eb',
                height: 4,
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stage.progressPercentage}%`,
                  height: '100%',
                  background: getStatusColor(stage.status),
                  transition: 'width 0.3s ease'
                }} />
              </div>
            )}
          </div>

          <div style={{
            fontSize: 12,
            color: getStatusColor(stage.status),
            fontWeight: 'bold'
          }}>
            {stage.status === 'running' ? `${stage.progressPercentage}%` : ''}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * قسم الاتجاهات
 */
const TrendsSection: React.FC<{
  trends: any;
  metrics: any;
  theme: any;
  isMobile: boolean;
}> = ({ trends, metrics, theme, isMobile }) => {
  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 16,
        marginBottom: 16
      }}>
        <div>
          <h5 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: 13 }}>
            📈 اتجاه الكفاءة
          </h5>
          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            fontSize: 12
          }}>
            {trends.efficiencyTrend && trends.efficiencyTrend.length > 0 ? (
              <div>
                آخر قياس: {trends.efficiencyTrend[trends.efficiencyTrend.length - 1].toFixed(1)}%
              </div>
            ) : (
              <div>لا توجد بيانات كافية</div>
            )}
          </div>
        </div>

        <div>
          <h5 style={{ margin: '0 0 8px 0', color: theme.text, fontSize: 13 }}>
            ⚠️ معدل الأخطاء
          </h5>
          <div style={{
            background: theme.resultBg,
            padding: 12,
            borderRadius: 8,
            fontSize: 12
          }}>
            {trends.errorRate && trends.errorRate.length > 0 ? (
              <div>
                آخر قياس: {trends.errorRate[trends.errorRate.length - 1].toFixed(1)}%
              </div>
            ) : (
              <div>لا توجد أخطاء</div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 11,
        color: theme.text,
        opacity: 0.7,
        textAlign: 'center'
      }}>
        آخر تحديث: {new Date(trends.lastUpdated).toLocaleTimeString('ar-SA')}
      </div>
    </div>
  );
};

export default ParallelProgressView;