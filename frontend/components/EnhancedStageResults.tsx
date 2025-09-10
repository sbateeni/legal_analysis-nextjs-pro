import React from 'react';

interface StageResult {
  id: number;
  name: string;
  status: 'completed' | 'failed' | 'pending' | 'locked';
  timeSpent?: number;
  textLength?: number;
  error?: string;
  requiresApiKey?: boolean;
}

interface EnhancedStageResultsProps {
  stages: StageResult[];
  totalStages: number;
  completedStages: number;
  failedStages: number;
  totalTime: number;
  className?: string;
}

export const EnhancedStageResults: React.FC<EnhancedStageResultsProps> = ({
  stages,
  totalStages,
  completedStages,
  failedStages,
  totalTime,
  className = ''
}) => {
  const progressPercentage = Math.round((completedStages / totalStages) * 100);
  const pendingStages = totalStages - completedStages - failedStages;
  const lockedStages = stages.filter(s => s.status === 'locked').length;

  // تجميع المراحل في مجموعات
  const analysisStages = stages.slice(0, 4);
  const legalStages = stages.slice(4, 8);
  const applicationStages = stages.slice(8, 12);
  const finalStages = stages.slice(12, 16);
  const petitionStage = stages.slice(16, 17);

  const getStatusIcon = (status: string, requiresApiKey?: boolean) => {
    if (requiresApiKey) return '⚠️';
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'locked': return '🔒';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string, requiresApiKey?: boolean) => {
    if (requiresApiKey) return 'يتطلب API Key';
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'failed': return 'فاشلة';
      case 'pending': return 'معلقة';
      default: return 'معلقة';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      case 'locked': return 'text-gray-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className={`enhanced-stage-results ${className}`}>
      {/* Header with Statistics */}
      <div className="results-header">
        <h3 className="text-2xl font-bold text-white mb-4">📊 تقدم التحليل القانوني</h3>
        <div className="progress-stats">
          <div className="circular-progress">
            <div className="progress-circle" style={{ '--progress': `${progressPercentage * 3.6}deg` } as React.CSSProperties}>
              <span className="progress-text">{progressPercentage}%</span>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{completedStages}</span>
              <span className="stat-label">مكتملة</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{failedStages}</span>
              <span className="stat-label">فاشلة</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{pendingStages}</span>
              <span className="stat-label">متبقية</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{lockedStages}</span>
              <span className="stat-label">مقفلة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Groups */}
      <div className="stage-groups">
        {/* المرحلة التحليلية */}
        <div className="stage-group">
          <h4 className="group-title">🔍 المرحلة التحليلية (1-4)</h4>
          <div className="stages-grid">
            {analysisStages.map(stage => (
              <div key={stage.id} className={`stage-card ${stage.status}`}>
                <div className="stage-header">
                  <span className="stage-number">{stage.id}</span>
                  <span className="stage-name">{stage.name}</span>
                </div>
                <div className="stage-status">
                  <span className="status-icon">{getStatusIcon(stage.status, stage.requiresApiKey)}</span>
                  <span className={`status-text ${getStatusColor(stage.status)}`}>
                    {getStatusText(stage.status, stage.requiresApiKey)}
                  </span>
                </div>
                {stage.timeSpent && (
                  <div className="stage-meta">
                    <span>⏱️ {stage.timeSpent} دقيقة</span>
                    <span>📝 {stage.textLength} حرف</span>
                  </div>
                )}
                {stage.error && (
                  <div className="stage-error">
                    <span className="error-text">{stage.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* المرحلة القضائية */}
        <div className="stage-group">
          <h4 className="group-title">⚖️ المرحلة القضائية (5-8)</h4>
          <div className="stages-grid">
            {legalStages.map(stage => (
              <div key={stage.id} className={`stage-card ${stage.status}`}>
                <div className="stage-header">
                  <span className="stage-number">{stage.id}</span>
                  <span className="stage-name">{stage.name}</span>
                </div>
                <div className="stage-status">
                  <span className="status-icon">{getStatusIcon(stage.status, stage.requiresApiKey)}</span>
                  <span className={`status-text ${getStatusColor(stage.status)}`}>
                    {getStatusText(stage.status, stage.requiresApiKey)}
                  </span>
                </div>
                {stage.timeSpent && (
                  <div className="stage-meta">
                    <span>⏱️ {stage.timeSpent} دقيقة</span>
                    <span>📝 {stage.textLength} حرف</span>
                  </div>
                )}
                {stage.error && (
                  <div className="stage-error">
                    <span className="error-text">{stage.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* المرحلة التطبيقية */}
        <div className="stage-group">
          <h4 className="group-title">🎯 المرحلة التطبيقية (9-12)</h4>
          <div className="stages-grid">
            {applicationStages.map(stage => (
              <div key={stage.id} className={`stage-card ${stage.status}`}>
                <div className="stage-header">
                  <span className="stage-number">{stage.id}</span>
                  <span className="stage-name">{stage.name}</span>
                </div>
                <div className="stage-status">
                  <span className="status-icon">{getStatusIcon(stage.status, stage.requiresApiKey)}</span>
                  <span className={`status-text ${getStatusColor(stage.status)}`}>
                    {getStatusText(stage.status, stage.requiresApiKey)}
                  </span>
                </div>
                {stage.timeSpent && (
                  <div className="stage-meta">
                    <span>⏱️ {stage.timeSpent} دقيقة</span>
                    <span>📝 {stage.textLength} حرف</span>
                  </div>
                )}
                {stage.error && (
                  <div className="stage-error">
                    <span className="error-text">{stage.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* المرحلة النهائية */}
        <div className="stage-group">
          <h4 className="group-title">🏁 المرحلة النهائية (13-16)</h4>
          <div className="stages-grid">
            {finalStages.map(stage => (
              <div key={stage.id} className={`stage-card ${stage.status}`}>
                <div className="stage-header">
                  <span className="stage-number">{stage.id}</span>
                  <span className="stage-name">{stage.name}</span>
                </div>
                <div className="stage-status">
                  <span className="status-icon">{getStatusIcon(stage.status, stage.requiresApiKey)}</span>
                  <span className={`status-text ${getStatusColor(stage.status)}`}>
                    {getStatusText(stage.status, stage.requiresApiKey)}
                  </span>
                </div>
                {stage.timeSpent && (
                  <div className="stage-meta">
                    <span>⏱️ {stage.timeSpent} دقيقة</span>
                    <span>📝 {stage.textLength} حرف</span>
                  </div>
                )}
                {stage.error && (
                  <div className="stage-error">
                    <span className="error-text">{stage.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* العريضة النهائية */}
        {petitionStage.length > 0 && (
          <div className="stage-group">
            <h4 className="group-title">📋 العريضة النهائية (17)</h4>
            <div className="stages-grid">
              {petitionStage.map(stage => (
                <div key={stage.id} className={`stage-card ${stage.status} petition-stage`}>
                  <div className="stage-header">
                    <span className="stage-number">{stage.id}</span>
                    <span className="stage-name">{stage.name}</span>
                  </div>
                  <div className="stage-status">
                    <span className="status-icon">{getStatusIcon(stage.status, stage.requiresApiKey)}</span>
                    <span className={`status-text ${getStatusColor(stage.status)}`}>
                      {getStatusText(stage.status, stage.requiresApiKey)}
                    </span>
                  </div>
                  {stage.timeSpent && (
                    <div className="stage-meta">
                      <span>⏱️ {stage.timeSpent} دقيقة</span>
                      <span>📝 {stage.textLength} حرف</span>
                    </div>
                  )}
                  {stage.error && (
                    <div className="stage-error">
                      <span className="error-text">{stage.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{totalTime}</span>
          <span className="stat-label">دقيقة</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⚡</span>
          <span className="stat-value">{completedStages > 0 ? Math.round(totalTime / completedStages) : 0}</span>
          <span className="stat-label">دقيقة/مرحلة</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <span className="stat-value">{progressPercentage}%</span>
          <span className="stat-label">معدل النجاح</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <span className="stat-value">{stages.reduce((acc, stage) => acc + (stage.textLength || 0), 0)}</span>
          <span className="stat-label">حرف محلل</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStageResults;
