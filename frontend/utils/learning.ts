import { getAllCases, updateCase } from './db';

interface LearningData {
  caseId: string;
  stageIndex: number;
  userFeedback: 'positive' | 'negative' | 'neutral';
  analysisQuality: number; // 1-10
  suggestions: string[];
  improvements: string[];
  timestamp: number;
}

interface StagePerformance {
  stageIndex: number;
  stageName: string;
  totalAnalyses: number;
  averageQuality: number;
  positiveFeedback: number;
  negativeFeedback: number;
  commonIssues: string[];
  improvements: string[];
}

interface LearningInsights {
  overallPerformance: number;
  bestStages: StagePerformance[];
  worstStages: StagePerformance[];
  commonPatterns: string[];
  recommendations: string[];
}

// تخزين بيانات التعلم
const learningData: LearningData[] = [];

// دالة حفظ ملاحظات المستخدم
export function saveUserFeedback(
  caseId: string,
  stageIndex: number,
  feedback: 'positive' | 'negative' | 'neutral',
  quality: number,
  suggestions: string[] = []
): void {
  const learningEntry: LearningData = {
    caseId,
    stageIndex,
    userFeedback: feedback,
    analysisQuality: quality,
    suggestions,
    improvements: [],
    timestamp: Date.now()
  };

  learningData.push(learningEntry);
  
  // حفظ في localStorage للاستمرارية
  localStorage.setItem('learning_data', JSON.stringify(learningData));
}

// دالة تحليل أداء المراحل
export function analyzeStagePerformance(): StagePerformance[] {
  const stageStats: Record<number, StagePerformance> = {};

  learningData.forEach(entry => {
    if (!stageStats[entry.stageIndex]) {
      stageStats[entry.stageIndex] = {
        stageIndex: entry.stageIndex,
        stageName: `المرحلة ${entry.stageIndex + 1}`,
        totalAnalyses: 0,
        averageQuality: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        commonIssues: [],
        improvements: []
      };
    }

    const stage = stageStats[entry.stageIndex];
    stage.totalAnalyses++;
    stage.averageQuality = (stage.averageQuality * (stage.totalAnalyses - 1) + entry.analysisQuality) / stage.totalAnalyses;

    if (entry.userFeedback === 'positive') {
      stage.positiveFeedback++;
    } else if (entry.userFeedback === 'negative') {
      stage.negativeFeedback++;
    }

    // جمع الاقتراحات والتحسينات
    entry.suggestions.forEach(suggestion => {
      if (!stage.improvements.includes(suggestion)) {
        stage.improvements.push(suggestion);
      }
    });
  });

  return Object.values(stageStats);
}

// دالة توليد رؤى التعلم
export function generateLearningInsights(): LearningInsights {
  const stagePerformance = analyzeStagePerformance();
  
  // حساب الأداء العام
  const overallPerformance = stagePerformance.length > 0 
    ? stagePerformance.reduce((sum, stage) => sum + stage.averageQuality, 0) / stagePerformance.length
    : 0;

  // أفضل وأسوأ المراحل
  const sortedStages = [...stagePerformance].sort((a, b) => b.averageQuality - a.averageQuality);
  const bestStages = sortedStages.slice(0, 3);
  const worstStages = sortedStages.slice(-3).reverse();

  // الأنماط الشائعة
  const commonPatterns: string[] = [];
  const allSuggestions = stagePerformance.flatMap(stage => stage.improvements);
  
  // تحليل الأنماط
  const suggestionCounts: Record<string, number> = {};
  allSuggestions.forEach(suggestion => {
    suggestionCounts[suggestion] = (suggestionCounts[suggestion] || 0) + 1;
  });

  Object.entries(suggestionCounts)
    .filter(([, count]) => count >= 2)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([pattern]) => commonPatterns.push(pattern));

  // التوصيات
  const recommendations: string[] = [];
  
  if (overallPerformance < 7) {
    recommendations.push('تحسين جودة التحليل العام للمراحل');
  }
  
  worstStages.forEach(stage => {
    recommendations.push(`تحسين المرحلة ${stage.stageIndex + 1}: ${stage.stageName}`);
  });

  if (commonPatterns.length > 0) {
    recommendations.push(`معالجة المشاكل الشائعة: ${commonPatterns.slice(0, 2).join(', ')}`);
  }

  return {
    overallPerformance,
    bestStages,
    worstStages,
    commonPatterns,
    recommendations
  };
}

// دالة تحسين الـ prompts بناءً على التعلم
export function generateImprovedPrompts(): Record<string, string> {
  const insights = generateLearningInsights();
  const improvedPrompts: Record<string, string> = {};

  // تحسين prompts للمراحل الضعيفة
  insights.worstStages.forEach(stage => {
    const improvements = stage.improvements.join('\n');
    improvedPrompts[`stage_${stage.stageIndex}`] = `
تحسينات مقترحة للمرحلة ${stage.stageIndex + 1}:
${improvements}

يرجى التركيز على هذه النقاط في التحليل القادم.
`;
  });

  return improvedPrompts;
}

// دالة تحميل بيانات التعلم
export function loadLearningData(): void {
  try {
    const saved = localStorage.getItem('learning_data');
    if (saved) {
      const data = JSON.parse(saved);
      learningData.length = 0;
      learningData.push(...data);
    }
  } catch (error) {
    console.error('Error loading learning data:', error);
  }
}

// دالة تصدير بيانات التعلم
export function exportLearningData(): string {
  return JSON.stringify({
    learningData,
    insights: generateLearningInsights(),
    timestamp: Date.now()
  }, null, 2);
}

// تحميل البيانات عند بدء التطبيق
if (typeof window !== 'undefined') {
  loadLearningData();
} 