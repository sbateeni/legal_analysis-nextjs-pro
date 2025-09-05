import React, { useState, useEffect } from 'react';
import { checkLegalSourcesHealth } from '@utils/legalContextService';

interface LegalSourcesStatusProps {
  theme: any;
  isMobile: boolean;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  online_sources: number;
  total_sources: number;
}

export default function LegalSourcesStatus({ theme, isMobile }: LegalSourcesStatusProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const status = await checkLegalSourcesHealth();
      setHealthStatus(status);
      setLastChecked(new Date());
    } catch (error) {
      console.error('خطأ في فحص حالة المصادر:', error);
      setHealthStatus({
        status: 'unhealthy',
        online_sources: 0,
        total_sources: 4
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // فحص دوري كل 5 دقائق
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'unhealthy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'جميع المصادر متاحة';
      case 'degraded': return 'بعض المصادر غير متاحة';
      case 'unhealthy': return 'المصادر غير متاحة';
      default: return 'جاري الفحص...';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '🔄';
    }
  };

  if (!healthStatus) {
    return (
      <div style={{
        background: theme.card,
        padding: isMobile ? '1rem' : '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: `0 1px 3px ${theme.shadow}`,
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: theme.text }}>جاري فحص حالة المصادر القانونية...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.card,
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: `0 1px 3px ${theme.shadow}`,
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: theme.text,
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            🌐 حالة المصادر القانونية الفلسطينية
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: getStatusColor(healthStatus.status),
              animation: healthStatus.status === 'healthy' ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{
              color: getStatusColor(healthStatus.status),
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              {getStatusIcon(healthStatus.status)} {getStatusText(healthStatus.status)}
            </span>
          </div>
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: loading ? '#9ca3af' : theme.accent,
            color: 'white',
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? '⏳' : '🔄'} تحديث
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          padding: '0.75rem',
          background: '#f8fafc',
          borderRadius: '0.5rem',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            المصادر المتاحة
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getStatusColor(healthStatus.status)
          }}>
            {healthStatus.online_sources}/{healthStatus.total_sources}
          </div>
        </div>
        
        <div style={{
          padding: '0.75rem',
          background: '#f8fafc',
          borderRadius: '0.5rem',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
            آخر فحص
          </div>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: theme.text
          }}>
            {lastChecked ? lastChecked.toLocaleTimeString('ar-SA') : 'غير متوفر'}
          </div>
        </div>
      </div>

      <div style={{
        padding: '0.75rem',
        background: healthStatus.status === 'healthy' ? '#f0fdf4' : 
                   healthStatus.status === 'degraded' ? '#fffbeb' : '#fef2f2',
        borderRadius: '0.5rem',
        border: `1px solid ${healthStatus.status === 'healthy' ? '#bbf7d0' : 
                              healthStatus.status === 'degraded' ? '#fed7aa' : '#fecaca'}`
      }}>
        <div style={{
          fontSize: '0.85rem',
          color: healthStatus.status === 'healthy' ? '#166534' : 
                 healthStatus.status === 'degraded' ? '#92400e' : '#dc2626',
          fontWeight: '600',
          marginBottom: '0.25rem'
        }}>
          {healthStatus.status === 'healthy' ? '✅ جميع المصادر القانونية متاحة' :
           healthStatus.status === 'degraded' ? '⚠️ بعض المصادر قد تكون غير متاحة' :
           '❌ المصادر القانونية غير متاحة حالياً'}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: healthStatus.status === 'healthy' ? '#166534' : 
                 healthStatus.status === 'degraded' ? '#92400e' : '#dc2626',
          opacity: 0.8
        }}>
          {healthStatus.status === 'healthy' ? 'يمكنك الحصول على إجابات دقيقة بناءً على القوانين الفلسطينية الرسمية' :
           healthStatus.status === 'degraded' ? 'قد تكون بعض الإجابات محدودة بسبب عدم توفر جميع المصادر' :
           'الإجابات ستكون عامة وقد لا تعكس أحدث القوانين الفلسطينية'}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
