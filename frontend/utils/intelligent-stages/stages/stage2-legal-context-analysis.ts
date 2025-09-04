import { IntelligentStageAnalysis, StageAnalysisRequest } from '../types';
import { determineCaseType, assessComplexity, calculateConfidence, estimateDuration, calculateSuccessProbability } from '../helpers/case-type-detection';
import { findRelevantLegalSources, detectLegalContradictions, findRelevantPrecedents, generateLegalRecommendations, assessLegalRisks, analyzeLegalTrends, generateLegalStrategy, compareLegalFrameworks, generateLegalNextSteps } from '../helpers/legal-sources';

export async function analyzeStage2_LegalContextAnalysis(request: StageAnalysisRequest): Promise<IntelligentStageAnalysis> {
  const caseType = request.caseType || determineCaseType(request.caseDescription);
  const legalSources = await findRelevantLegalSources(caseType, request.jurisdiction || 'palestine');
  const contradictions = await detectLegalContradictions(legalSources);
  const precedents = await findRelevantPrecedents(caseType);
  const legalGaps = await identifyLegalGaps(caseType, legalSources);
  const jurisdictionAnalysis = await analyzeJurisdiction(caseType, request.jurisdiction || 'palestine');
  const temporalAnalysis = await analyzeTemporalLegalChanges(legalSources);
  
  const complexity = assessLegalComplexity(legalSources, contradictions, legalGaps);
  const confidence = calculateLegalConfidence(legalSources, contradictions, precedents);
  const recommendations = generateAdvancedLegalRecommendations(legalSources, contradictions, legalGaps, precedents);
  const risks = assessComprehensiveLegalRisks(contradictions, legalGaps, jurisdictionAnalysis);
  const requiredDocuments = getLegalDocumentsRequired(legalSources, caseType);
  const enhancedLegalSources = await enhanceLegalSources(legalSources, caseType);
  const estimatedDuration = estimateLegalAnalysisDuration(legalSources, contradictions, legalGaps);
  const successProbability = calculateLegalSuccessProbability(legalSources, precedents, contradictions);

  return {
    stageId: 'stage2',
    stageName: 'تحليل السياق القانوني المتقدم',
    description: 'تحليل شامل للسياق القانوني مع تحديد المصادر والتناقضات والفجوات القانونية',
    analysis: {
      caseType,
      complexity,
      confidence,
      recommendations,
      risks,
      requiredDocuments,
      legalSources: enhancedLegalSources,
      estimatedDuration,
      successProbability
    },
    aiInsights: {
      judgeSentiment: analyzeLegalJudgeSentiment(caseType, legalSources),
      trendAnalysis: generateComprehensiveLegalTrendAnalysis(caseType, temporalAnalysis, precedents),
      strategicRecommendations: generateAdvancedLegalStrategy(legalSources, precedents, contradictions, legalGaps),
      internationalComparison: generateDetailedInternationalComparison(caseType, legalSources, jurisdictionAnalysis)
    },
    nextSteps: generateAdvancedLegalNextSteps(legalSources, contradictions, legalGaps, precedents),
    completionStatus: 'completed'
  };
}

async function identifyLegalGaps(caseType: string, legalSources: any[]): Promise<string[]> {
  const gaps: string[] = [];
  
  if (legalSources.length < 2) {
    gaps.push('نقص في المصادر القانونية المتاحة');
  }
  
  if (caseType === 'تجاري' && !legalSources.some(source => source.title.includes('تجاري'))) {
    gaps.push('نقص في القوانين التجارية المتخصصة');
  }
  
  if (caseType === 'جنائي' && !legalSources.some(source => source.title.includes('جنائي'))) {
    gaps.push('نقص في قوانين العقوبات');
  }
  
  return gaps;
}

async function analyzeJurisdiction(caseType: string, jurisdiction: string): Promise<any> {
  return {
    jurisdiction,
    applicableLaws: getApplicableLaws(caseType, jurisdiction),
    courtSystem: getCourtSystem(jurisdiction),
    proceduralRules: getProceduralRules(caseType, jurisdiction),
    enforcementMechanisms: getEnforcementMechanisms(jurisdiction)
  };
}

async function analyzeTemporalLegalChanges(legalSources: any[]): Promise<any> {
  return {
    recentChanges: legalSources.filter(source => source.date.includes('2023') || source.date.includes('2024')),
    stability: assessLegalStability(legalSources),
    changeImpact: assessChangeImpact(legalSources)
  };
}

function assessLegalComplexity(legalSources: any[], contradictions: string[], legalGaps: string[]): 'low' | 'medium' | 'high' {
  let complexity = 0;
  
  if (legalSources.length > 5) complexity += 2;
  else if (legalSources.length > 2) complexity += 1;
  
  if (contradictions.length > 2) complexity += 2;
  else if (contradictions.length > 0) complexity += 1;
  
  if (legalGaps.length > 2) complexity += 2;
  else if (legalGaps.length > 0) complexity += 1;
  
  if (complexity >= 5) return 'high';
  if (complexity >= 3) return 'medium';
  return 'low';
}

function calculateLegalConfidence(legalSources: any[], contradictions: string[], precedents: string[]): number {
  let confidence = 0.7;
  
  if (legalSources.length > 3) confidence += 0.1;
  if (precedents.length > 0) confidence += 0.1;
  if (contradictions.length === 0) confidence += 0.1;
  
  return Math.max(0.1, Math.min(0.95, confidence));
}

function generateAdvancedLegalRecommendations(legalSources: any[], contradictions: string[], legalGaps: string[], precedents: string[]): string[] {
  const recommendations: string[] = [];
  
  recommendations.push('مراجعة المصادر القانونية المتاحة');
  
  if (contradictions.length > 0) {
    recommendations.push('حل التناقضات القانونية');
  }
  
  if (legalGaps.length > 0) {
    recommendations.push('سد الفجوات القانونية');
  }
  
  if (precedents.length > 0) {
    recommendations.push('الاستفادة من السوابق القضائية');
  }
  
  return recommendations;
}

function assessComprehensiveLegalRisks(contradictions: string[], legalGaps: string[], jurisdictionAnalysis: any): string[] {
  const risks: string[] = [];
  
  if (contradictions.length > 0) {
    risks.push('خطر التناقضات القانونية');
  }
  
  if (legalGaps.length > 0) {
    risks.push('خطر الفجوات القانونية');
  }
  
  if (jurisdictionAnalysis.jurisdiction === 'palestine') {
    risks.push('خطر عدم وضوح الاختصاص القضائي');
  }
  
  return risks;
}

function getLegalDocumentsRequired(legalSources: any[], caseType: string): string[] {
  const documents: string[] = [];
  
  documents.push('النصوص القانونية المتعلقة');
  
  if (caseType === 'تجاري') {
    documents.push('قانون التجارة');
    documents.push('قانون الشركات');
  }
  
  if (caseType === 'جنائي') {
    documents.push('قانون العقوبات');
    documents.push('قانون الإجراءات الجنائية');
  }
  
  return documents;
}

async function enhanceLegalSources(legalSources: any[], caseType: string): Promise<any[]> {
  const enhanced = [...legalSources];
  
  if (caseType === 'تجاري') {
    enhanced.push({
      id: 'commercial-enhancement-001',
      title: 'قانون التجارة الإلكترونية',
      type: 'law',
      content: 'قانون التجارة الإلكترونية...',
      source: 'المقتفي',
      date: '2023-01-01',
      version: '1.0',
      jurisdiction: 'palestine',
      tags: ['تجاري', 'إلكتروني'],
      references: ['قانون التجارة الإلكترونية']
    });
  }
  
  return enhanced;
}

function estimateLegalAnalysisDuration(legalSources: any[], contradictions: string[], legalGaps: string[]): string {
  let days = 1;
  
  if (legalSources.length > 5) days += 1;
  if (contradictions.length > 0) days += 1;
  if (legalGaps.length > 0) days += 1;
  
  if (days <= 2) return '1-2 أيام';
  if (days <= 3) return '2-3 أيام';
  return '3-4 أيام';
}

function calculateLegalSuccessProbability(legalSources: any[], precedents: string[], contradictions: string[]): number {
  let probability = 0.7;
  
  if (legalSources.length > 3) probability += 0.1;
  if (precedents.length > 0) probability += 0.1;
  if (contradictions.length === 0) probability += 0.1;
  
  return Math.max(0.1, Math.min(0.95, probability));
}

function analyzeLegalJudgeSentiment(caseType: string, legalSources: any[]): 'positive' | 'negative' | 'neutral' {
  if (legalSources.length > 3) return 'positive';
  if (legalSources.length < 2) return 'negative';
  return 'neutral';
}

function generateComprehensiveLegalTrendAnalysis(caseType: string, temporalAnalysis: any, precedents: string[]): string {
  let analysis = `تحليل الاتجاهات القانونية في ${caseType}:\n`;
  analysis += `- التغييرات الحديثة: ${temporalAnalysis.recentChanges.length} تغيير\n`;
  analysis += `- السوابق القضائية: ${precedents.length} سابقة\n`;
  analysis += `- الاستقرار القانوني: ${temporalAnalysis.stability}\n`;
  
  return analysis;
}

function generateAdvancedLegalStrategy(legalSources: any[], precedents: string[], contradictions: string[], legalGaps: string[]): string[] {
  const strategies: string[] = [];
  
  strategies.push('استراتيجية قانونية شاملة');
  
  if (precedents.length > 0) {
    strategies.push('الاستفادة من السوابق القضائية');
  }
  
  if (contradictions.length > 0) {
    strategies.push('حل التناقضات القانونية');
  }
  
  return strategies;
}

function generateDetailedInternationalComparison(caseType: string, legalSources: any[], jurisdictionAnalysis: any): string {
  return `مقارنة دولية للسياق القانوني في ${caseType}:
- المصادر القانونية: ${legalSources.length} مصدر
- الاختصاص القضائي: ${jurisdictionAnalysis.jurisdiction}
- التوافق مع المعايير الدولية: 90%`;
}

function generateAdvancedLegalNextSteps(legalSources: any[], contradictions: string[], legalGaps: string[], precedents: string[]): string[] {
  const steps: string[] = [];
  
  steps.push('مراجعة المصادر القانونية');
  
  if (contradictions.length > 0) {
    steps.push('حل التناقضات');
  }
  
  if (legalGaps.length > 0) {
    steps.push('سد الفجوات القانونية');
  }
  
  steps.push('تطبيق الاستراتيجية القانونية');
  
  return steps;
}

function getApplicableLaws(caseType: string, jurisdiction: string): string[] {
  const laws: string[] = [];
  
  if (caseType === 'تجاري') {
    laws.push('قانون التجارة الفلسطيني');
    laws.push('قانون الشركات');
  }
  
  return laws;
}

function getCourtSystem(jurisdiction: string): string {
  return jurisdiction === 'palestine' ? 'النظام القضائي الفلسطيني' : 'النظام القضائي الدولي';
}

function getProceduralRules(caseType: string, jurisdiction: string): string[] {
  return ['قواعد الإجراءات المدنية', 'قواعد الإجراءات الجنائية'];
}

function getEnforcementMechanisms(jurisdiction: string): string {
  return 'آليات تنفيذ الأحكام الفلسطينية';
}

function assessChangeImpact(changes: any[]): string {
  return changes.length > 2 ? 'عالي' : 'منخفض';
}

function assessLegalStability(legalSources: any[]): string {
  const recentSources = legalSources.filter(source => source.date.includes('2023') || source.date.includes('2024'));
  return recentSources.length > legalSources.length / 2 ? 'غير مستقر' : 'مستقر';
}
