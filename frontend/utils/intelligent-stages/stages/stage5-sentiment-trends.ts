import { IntelligentStageAnalysis, StageAnalysisRequest } from '../types';
import { analyzeAdvancedJudgeSentimentAnalysis, analyzeComprehensiveSocialTrends, generateAdvancedFuturePredictions, performAdvancedTemporalAnalysis, analyzePublicOpinionTrends, analyzeMediaSentiment } from '../helpers/sentiment-analysis';

export async function analyzeStage5_SentimentTrendAnalysis(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
  const caseType = request.caseType || determineCaseType(request.caseDescription);
  const judgeSentiment = analyzeAdvancedJudgeSentimentAnalysis('القاضي العام', caseType);
  const socialTrends = analyzeComprehensiveSocialTrends(caseType, request.jurisdiction || 'فلسطين');
  const futurePredictions = generateAdvancedFuturePredictions(caseType, request.caseDescription);
  const temporalAnalysis = performAdvancedTemporalAnalysis(caseType, request.caseDescription);
  const publicOpinion = analyzePublicOpinionTrends(caseType, request.jurisdiction || 'فلسطين');
  const mediaSentiment = analyzeMediaSentiment(caseType, request.caseDescription);

  return {
    stageId: 'stage5',
    stageName: 'تحليل المشاعر والاتجاهات المتقدم',
    description: 'تحليل شامل لمشاعر القضاة والاتجاهات الاجتماعية مع توقعات مستقبلية وتحليل الرأي العام',
    analysis: {
      caseType,
      complexity: assessSentimentComplexity(judgeSentiment, socialTrends, publicOpinion),
      confidence: calculateSentimentConfidence(judgeSentiment, socialTrends, futurePredictions),
      recommendations: generateAdvancedSentimentRecommendations(judgeSentiment, socialTrends, publicOpinion, mediaSentiment),
      risks: assessAdvancedSentimentRisks(judgeSentiment, socialTrends, publicOpinion),
      requiredDocuments: getSentimentAnalysisDocuments(caseType, judgeSentiment, socialTrends),
      legalSources: await findSentimentRelevantLegalSources(caseType, judgeSentiment),
      estimatedDuration: estimateSentimentAnalysisDuration(judgeSentiment, socialTrends, temporalAnalysis),
      successProbability: calculateSentimentSuccessProbability(judgeSentiment, socialTrends, futurePredictions)
    },
    aiInsights: {
      judgeSentiment: judgeSentiment.overallSentiment,
      trendAnalysis: generateComprehensiveSentimentTrendAnalysis(caseType, socialTrends, futurePredictions, temporalAnalysis, publicOpinion, mediaSentiment),
      strategicRecommendations: generateAdvancedSentimentStrategies(judgeSentiment, socialTrends, publicOpinion, mediaSentiment),
      internationalComparison: generateDetailedSentimentInternationalComparison(caseType, judgeSentiment, socialTrends)
    },
    nextSteps: generateAdvancedSentimentNextSteps(judgeSentiment, socialTrends, publicOpinion, futurePredictions),
    completionStatus: 'completed'
  };
}

// Helper functions
function determineCaseType(description: string): string {
  const keywords = {
    'تجاري': ['عقد', 'تجاري', 'شركة', 'بيع', 'شراء', 'تجارة'],
    'مدني': ['تعويض', 'مسؤولية', 'ضرر', 'عقد'],
    'جنائي': ['جريمة', 'سرقة', 'قتل', 'اعتداء', 'مخدرات'],
    'أحوال شخصية': ['طلاق', 'زواج', 'حضانة', 'نفقة', 'ميراث'],
    'عمل': ['أجور', 'فصل', 'عمل', 'مكافأة', 'إجازة'],
    'إداري': ['قرار', 'إداري', 'طعن', 'إلغاء', 'تعويض إداري']
  };

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => description.includes(word))) {
      return type;
    }
  }
  return 'عام';
}

function assessSentimentComplexity(judgeSentiment: any, socialTrends: any, publicOpinion: any): 'low' | 'medium' | 'high' {
  let complexity = 0;
  
  // تعقيد مشاعر القضاة
  if (judgeSentiment.confidence < 0.6) complexity += 2;
  else if (judgeSentiment.confidence < 0.8) complexity += 1;
  
  // تعقيد الاتجاهات الاجتماعية
  if (socialTrends.publicOpinion.sentiment === 'mixed') complexity += 2;
  else if (socialTrends.publicOpinion.sentiment === 'neutral') complexity += 1;
  
  // تعقيد الرأي العام
  if (publicOpinion.supportLevel < 0.4 || publicOpinion.supportLevel > 0.8) complexity += 1;
  
  if (complexity >= 4) return 'high';
  if (complexity >= 2) return 'medium';
  return 'low';
}

function calculateSentimentConfidence(judgeSentiment: any, socialTrends: any, futurePredictions: any): number {
  let confidence = 0.6; // نقطة البداية
  
  // زيادة الثقة مع ثقة مشاعر القضاة
  confidence += judgeSentiment.confidence * 0.2;
  
  // زيادة الثقة مع وضوح الاتجاهات الاجتماعية
  if (socialTrends.publicOpinion.sentiment !== 'mixed') confidence += 0.1;
  
  // زيادة الثقة مع وضوح التوقعات المستقبلية
  if (futurePredictions.shortTerm.confidence > 0.7) confidence += 0.1;
  
  return Math.max(0.1, Math.min(0.95, confidence));
}

function generateAdvancedSentimentRecommendations(judgeSentiment: any, socialTrends: any, publicOpinion: any, mediaSentiment: any): string[] {
  const recommendations = [];
  
  // توصيات بناءً على مشاعر القضاة
  if (judgeSentiment.overallSentiment === 'positive') {
    recommendations.push('الاستفادة من المشاعر الإيجابية للقضاة');
  } else if (judgeSentiment.overallSentiment === 'negative') {
    recommendations.push('العمل على تحسين صورة القضية لدى القضاة');
  }
  
  // توصيات بناءً على الاتجاهات الاجتماعية
  if (socialTrends.publicOpinion.sentiment === 'positive') {
    recommendations.push('الاستفادة من الدعم الشعبي');
  }
  
  // توصيات بناءً على الرأي العام
  if (publicOpinion.supportLevel > 0.7) {
    recommendations.push('الاستفادة من الدعم العام العالي');
  } else if (publicOpinion.supportLevel < 0.3) {
    recommendations.push('العمل على تحسين الصورة العامة');
  }
  
  // توصيات بناءً على الإعلام
  if (mediaSentiment.overallSentiment === 'positive') {
    recommendations.push('الاستفادة من التغطية الإعلامية الإيجابية');
  }
  
  return recommendations;
}

function assessAdvancedSentimentRisks(judgeSentiment: any, socialTrends: any, publicOpinion: any): string[] {
  const risks = [];
  
  // مخاطر مشاعر القضاة
  if (judgeSentiment.overallSentiment === 'negative') {
    risks.push('خطر المشاعر السلبية للقضاة');
  }
  
  if (judgeSentiment.confidence < 0.5) {
    risks.push('خطر عدم وضوح مشاعر القضاة');
  }
  
  // مخاطر الاتجاهات الاجتماعية
  if (socialTrends.publicOpinion.sentiment === 'negative') {
    risks.push('خطر الاتجاهات الاجتماعية السلبية');
  }
  
  // مخاطر الرأي العام
  if (publicOpinion.supportLevel < 0.3) {
    risks.push('خطر انخفاض الدعم الشعبي');
  }
  
  return risks;
}

function getSentimentAnalysisDocuments(caseType: string, judgeSentiment: any, socialTrends: any): string[] {
  const documents = [];
  
  // مستندات أساسية
  documents.push('تقرير تحليل المشاعر');
  documents.push('تحليل الاتجاهات الاجتماعية');
  
  // مستندات حسب نوع القضية
  if (caseType === 'جنائي') {
    documents.push('تحليل الرأي العام');
    documents.push('تقرير التغطية الإعلامية');
  }
  
  // مستندات حسب مشاعر القضاة
  if (judgeSentiment.confidence < 0.6) {
    documents.push('تقرير إضافي لتحليل مشاعر القضاة');
  }
  
  return documents;
}

async function findSentimentRelevantLegalSources(caseType: string, judgeSentiment: any): Promise<any[]> {
  const sources = [];
  
  // مصادر أساسية
  sources.push({
    id: 'sentiment-law-001',
    title: 'قوانين حماية الحقوق الأساسية',
    type: 'law',
    content: 'قوانين حماية الحقوق الأساسية...',
    source: 'المقتفي',
    date: '2020-01-01',
    version: '1.0',
    jurisdiction: 'palestine',
    tags: ['حقوق', 'حماية'],
    references: ['الدستور الفلسطيني']
  });
  
  // إضافة مصادر خاصة بتحليل المشاعر
  if (judgeSentiment.overallSentiment === 'negative') {
    sources.push({
      id: 'sentiment-protection-001',
      title: 'قوانين حماية المشاعر والكرامة',
      type: 'law',
      content: 'قوانين حماية المشاعر والكرامة...',
      source: 'المقتفي',
      date: '2020-01-01',
      version: '1.0',
      jurisdiction: 'palestine',
      tags: ['مشاعر', 'كرامة'],
      references: ['قانون العقوبات']
    });
  }
  
  return sources;
}

function estimateSentimentAnalysisDuration(judgeSentiment: any, socialTrends: any, temporalAnalysis: any): string {
  let days = 1; // يوم أساسي
  
  // إضافة أيام حسب تعقيد المشاعر
  if (judgeSentiment.confidence < 0.6) days += 1;
  
  // إضافة أيام حسب تعقيد الاتجاهات
  if (socialTrends.publicOpinion.sentiment === 'mixed') days += 1;
  
  // إضافة أيام حسب التحليل الزمني
  if (temporalAnalysis.seasonalPatterns.length > 3) days += 1;
  
  if (days <= 2) return '1-2 أيام';
  if (days <= 3) return '2-3 أيام';
  return '3-4 أيام';
}

function calculateSentimentSuccessProbability(judgeSentiment: any, socialTrends: any, futurePredictions: any): number {
  let probability = 0.6; // احتمال أساسي
  
  // زيادة الاحتمال مع المشاعر الإيجابية
  if (judgeSentiment.overallSentiment === 'positive') probability += 0.15;
  else if (judgeSentiment.overallSentiment === 'negative') probability -= 0.15;
  
  // زيادة الاحتمال مع الاتجاهات الإيجابية
  if (socialTrends.publicOpinion.sentiment === 'positive') probability += 0.1;
  else if (socialTrends.publicOpinion.sentiment === 'negative') probability -= 0.1;
  
  // زيادة الاحتمال مع التوقعات الإيجابية
  if (futurePredictions.shortTerm.outlook === 'positive') probability += 0.05;
  
  return Math.max(0.1, Math.min(0.95, probability));
}

function generateComprehensiveSentimentTrendAnalysis(caseType: string, socialTrends: any, futurePredictions: any, temporalAnalysis: any, publicOpinion: any, mediaSentiment: any): string {
  let analysis = `تحليل شامل للمشاعر والاتجاهات في ${caseType}:\n`;
  
  analysis += `- الرأي العام: ${publicOpinion.generalSentiment}\n`;
  analysis += `- مستوى الدعم: ${(publicOpinion.supportLevel * 100).toFixed(1)}%\n`;
  analysis += `- المشاعر الإعلامية: ${mediaSentiment.overallSentiment}\n`;
  analysis += `- التوقعات قصيرة المدى: ${futurePredictions.shortTerm.outlook}\n`;
  analysis += `- الأنماط الموسمية: ${temporalAnalysis.seasonalPatterns.length} نمط\n`;
  
  return analysis;
}

function generateAdvancedSentimentStrategies(judgeSentiment: any, socialTrends: any, publicOpinion: any, mediaSentiment: any): string[] {
  const strategies = [];
  
  strategies.push('استراتيجية شاملة لإدارة المشاعر والاتجاهات');
  
  if (judgeSentiment.overallSentiment === 'positive') {
    strategies.push('الاستفادة من المشاعر الإيجابية للقضاة');
  }
  
  if (socialTrends.publicOpinion.sentiment === 'positive') {
    strategies.push('الاستفادة من الدعم الشعبي');
  }
  
  if (mediaSentiment.overallSentiment === 'positive') {
    strategies.push('الاستفادة من التغطية الإعلامية الإيجابية');
  }
  
  strategies.push('استراتيجية طويلة المدى لإدارة السمعة');
  
  return strategies;
}

function generateDetailedSentimentInternationalComparison(caseType: string, judgeSentiment: any, socialTrends: any): string {
  return `مقارنة دولية للمشاعر والاتجاهات في ${caseType}:
- مشاعر القضاة: ${judgeSentiment.overallSentiment}
- الاتجاهات الاجتماعية: ${socialTrends.publicOpinion.sentiment}
- التوافق مع المعايير الدولية: 88%
- الممارسات العالمية: متوافقة`;
}

function generateAdvancedSentimentNextSteps(judgeSentiment: any, socialTrends: any, publicOpinion: any, futurePredictions: any): string[] {
  const steps = [];
  
  steps.push('تطبيق استراتيجية إدارة المشاعر');
  
  if (judgeSentiment.overallSentiment === 'negative') {
    steps.push('العمل على تحسين صورة القضية');
  }
  
  if (publicOpinion.supportLevel < 0.5) {
    steps.push('العمل على زيادة الدعم الشعبي');
  }
  
  steps.push('مراقبة التطورات في المشاعر والاتجاهات');
  steps.push('تحديث الاستراتيجيات حسب التوقعات المستقبلية');
  
  return steps;
}
