import { IntelligentStageAnalysis, StageAnalysisRequest } from '../types';
import { determineCaseType, assessComplexity, calculateConfidence, estimateDuration, calculateSuccessProbability } from '../helpers/case-type-detection';
import { findRelevantLegalSources } from '../helpers/legal-sources';

export async function analyzeStage1_InformationGathering(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
  const caseType = request.caseType || determineCaseType(request.caseDescription);
  const complexity = assessComplexity(request.caseDescription, caseType);
  const requiredDocuments = getRequiredDocuments(caseType);
  const documentRisks = assessDocumentRisks(request.documents || [], caseType);
  const legalSources = await findRelevantLegalSources(caseType, request.jurisdiction || 'palestine');
  const confidence = calculateConfidence(request.caseDescription);
  const recommendations = generateDocumentRecommendations(caseType, complexity);
  const estimatedDuration = estimateDuration(complexity);
  const successProbability = calculateSuccessProbability(caseType, complexity);

  return {
    stageId: 'stage1',
    stageName: 'جمع المعلومات الذكي',
    description: 'تحليل ذكي للمعلومات المطلوبة مع تحديد نوع القضية والتعقيد',
    analysis: {
      caseType,
      complexity,
      confidence,
      recommendations,
      risks: documentRisks,
      requiredDocuments,
      legalSources,
      estimatedDuration,
      successProbability
    },
    aiInsights: {
      judgeSentiment: analyzeJudgeSentiment(caseType),
      trendAnalysis: analyzeTrends(caseType),
      strategicRecommendations: generateStrategicRecommendations(caseType, complexity),
      internationalComparison: compareWithInternationalStandards(caseType)
    },
    nextSteps: generateNextSteps(caseType, complexity),
    completionStatus: 'completed'
  };
}

function getRequiredDocuments(caseType: string): string[] {
  const documents: string[] = [];
  
  // مستندات أساسية
  documents.push('الهوية الشخصية');
  documents.push('الوثائق القانونية الأساسية');
  
  // مستندات حسب نوع القضية
  if (caseType === 'تجاري') {
    documents.push('العقود التجارية');
    documents.push('السجلات المالية');
    documents.push('رخصة النشاط التجاري');
  } else if (caseType === 'جنائي') {
    documents.push('التقرير الطبي');
    documents.push('شهادات الشهود');
    documents.push('الأدلة المادية');
  } else if (caseType === 'أحوال شخصية') {
    documents.push('شهادة الزواج');
    documents.push('شهادة الميلاد للأطفال');
    documents.push('الإقرارات المالية');
  }
  
  return documents;
}

function assessDocumentRisks(documents: string[], caseType: string): string[] {
  const risks: string[] = [];
  
  if (documents.length < 3) {
    risks.push('خطر نقص المستندات المطلوبة');
  }
  
  if (caseType === 'جنائي' && !documents.some(d => d.includes('شاهد'))) {
    risks.push('خطر عدم وجود شهود');
  }
  
  if (caseType === 'تجاري' && !documents.some(d => d.includes('عقد'))) {
    risks.push('خطر عدم وجود عقود مكتوبة');
  }
  
  return risks;
}

function generateDocumentRecommendations(caseType: string, complexity: string): string[] {
  const recommendations: string[] = [];
  
  recommendations.push('جمع جميع المستندات المطلوبة');
  
  if (complexity === 'high') {
    recommendations.push('طلب مساعدة خبير قانوني');
    recommendations.push('إعداد ملف شامل ومنظم');
  }
  
  if (caseType === 'جنائي') {
    recommendations.push('التأكد من صحة الأدلة');
    recommendations.push('توثيق جميع الإجراءات');
  }
  
  return recommendations;
}

function analyzeJudgeSentiment(caseType: string): 'positive' | 'negative' | 'neutral' {
  const sentiments: Record<string, 'positive' | 'negative' | 'neutral'> = {
    'تجاري': 'neutral',
    'مدني': 'positive',
    'جنائي': 'negative',
    'أحوال شخصية': 'positive',
    'عمل': 'neutral',
    'إداري': 'negative'
  };
  
  return sentiments[caseType] || 'neutral';
}

function analyzeTrends(caseType: string): string {
  return `اتجاهات في ${caseType}: تطور في عدد القضايا ونوعها`;
}

function generateStrategicRecommendations(caseType: string, complexity: string): string[] {
  const recommendations: string[] = [];
  
  recommendations.push('استراتيجية جمع المعلومات الشاملة');
  
  if (complexity === 'high') {
    recommendations.push('استراتيجية متقدمة للتعامل مع التعقيد');
  }
  
  return recommendations;
}

function compareWithInternationalStandards(caseType: string): string {
  return `مقارنة مع المعايير الدولية لـ ${caseType}`;
}

function generateNextSteps(caseType: string, complexity: string): string[] {
  const steps: string[] = [];
  
  steps.push('جمع المستندات المطلوبة');
  steps.push('تنظيم الملف');
  
  if (complexity === 'high') {
    steps.push('طلب استشارة قانونية متخصصة');
  }
  
  steps.push('الانتقال للمرحلة التالية');
  
  return steps;
}
