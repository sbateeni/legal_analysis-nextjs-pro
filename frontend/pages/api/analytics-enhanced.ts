import { NextApiRequest, NextApiResponse } from 'next';
import { extractLegalContext, buildLegalContextString, optimizeLegalQuery } from '@utils/legalContextService';

interface EnhancedAnalyticsRequest {
  caseId?: string;
  caseType?: string;
  caseDescription?: string;
  includeLegalContext?: boolean;
}

interface EnhancedAnalyticsResponse {
  status: 'success' | 'error';
  analytics: {
    basic_analytics: any;
    legal_context?: {
      relevant_laws: Array<{
        title: string;
        content: string;
        source: string;
        relevance_score: number;
        type: string;
      }>;
      legal_recommendations: string[];
      risk_assessment: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
        mitigation_strategies: string[];
      };
    };
    predictive_analysis: {
      success_probability: number;
      estimated_duration: string;
      complexity_score: number;
      key_factors: string[];
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnhancedAnalyticsResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      analytics: {} as any,
      error: 'طريقة غير مسموحة'
    });
  }

  try {
    const { caseId, caseType, caseDescription, includeLegalContext = true }: EnhancedAnalyticsRequest = req.body;

    // التحليلات الأساسية (يمكن استيرادها من النظام الحالي)
    const basicAnalytics = {
      case_id: caseId,
      case_type: caseType,
      analysis_date: new Date().toISOString(),
      // يمكن إضافة المزيد من التحليلات الأساسية هنا
    };

    let legalContext = null;
    
    // استخراج السياق القانوني إذا كان مطلوباً
    if (includeLegalContext && (caseType || caseDescription)) {
      try {
        const query = caseDescription || caseType || '';
        const optimizedQuery = optimizeLegalQuery(query);
        const legalContextResult = await extractLegalContext(optimizedQuery, 5);
        
        if (legalContextResult.status === 'success' && legalContextResult.results.length > 0) {
          const relevantLaws = legalContextResult.results.map(result => ({
            title: result.title,
            content: result.content,
            source: result.source,
            relevance_score: result.relevance_score,
            type: result.type
          }));

          // تحليل المخاطر بناءً على السياق القانوني
          const riskAssessment = analyzeLegalRisk(relevantLaws, caseType);
          
          // التوصيات القانونية
          const legalRecommendations = generateLegalRecommendations(relevantLaws, caseType);

          legalContext = {
            relevant_laws: relevantLaws,
            legal_recommendations: legalRecommendations,
            risk_assessment: riskAssessment
          };
        }
      } catch (error) {
        console.warn('فشل في استخراج السياق القانوني:', error);
      }
    }

    // التحليل التنبؤي المحسن
    const predictiveAnalysis = generateEnhancedPredictiveAnalysis(
      caseType,
      caseDescription,
      legalContext
    );

    const response: EnhancedAnalyticsResponse = {
      status: 'success',
      analytics: {
        basic_analytics: basicAnalytics,
        legal_context: legalContext || undefined,
        predictive_analysis: predictiveAnalysis
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('خطأ في API التحليلات المحسنة:', error);
    res.status(500).json({
      status: 'error',
      analytics: {} as any,
      error: error instanceof Error ? error.message : 'خطأ داخلي في الخادم'
    });
  }
}

/**
 * تحليل المخاطر القانونية
 */
function analyzeLegalRisk(
  relevantLaws: Array<{ title: string; content: string; source: string; relevance_score: number; type: string }>,
  caseType?: string
): { level: 'low' | 'medium' | 'high'; factors: string[]; mitigation_strategies: string[] } {
  const factors: string[] = [];
  const mitigationStrategies: string[] = [];
  let riskScore = 0;

  // تحليل نوع القضية
  if (caseType) {
    if (caseType.includes('جنائي') || caseType.includes('عقوبات')) {
      riskScore += 30;
      factors.push('قضية جنائية - مخاطر عالية');
      mitigationStrategies.push('الاستعانة بمحام متخصص في القانون الجنائي');
    } else if (caseType.includes('تجاري')) {
      riskScore += 20;
      factors.push('قضية تجارية - مخاطر متوسطة');
      mitigationStrategies.push('مراجعة العقود والاتفاقيات بعناية');
    } else if (caseType.includes('مدني')) {
      riskScore += 15;
      factors.push('قضية مدنية - مخاطر منخفضة إلى متوسطة');
      mitigationStrategies.push('توثيق جميع الأدلة والوثائق');
    }
  }

  // تحليل القوانين ذات الصلة
  relevantLaws.forEach(law => {
    if (law.relevance_score > 0.8) {
      riskScore += 10;
      factors.push(`قانون عالي الصلة: ${law.title}`);
    }
    
    if (law.type === 'legislation' && law.content.includes('عقوبة')) {
      riskScore += 15;
      factors.push('يحتوي على أحكام عقابية');
      mitigationStrategies.push('فهم العقوبات المقررة والبدائل المتاحة');
    }
  });

  // تحديد مستوى المخاطر
  let level: 'low' | 'medium' | 'high';
  if (riskScore < 30) {
    level = 'low';
  } else if (riskScore < 60) {
    level = 'medium';
  } else {
    level = 'high';
  }

  // استراتيجيات إضافية حسب مستوى المخاطر
  if (level === 'high') {
    mitigationStrategies.push('طلب استشارة قانونية فورية');
    mitigationStrategies.push('إعداد خطة دفاع شاملة');
  } else if (level === 'medium') {
    mitigationStrategies.push('مراجعة دورية للتطورات');
    mitigationStrategies.push('إعداد وثائق داعمة');
  } else {
    mitigationStrategies.push('متابعة روتينية للحالة');
  }

  return {
    level,
    factors,
    mitigation_strategies: mitigationStrategies
  };
}

/**
 * توليد التوصيات القانونية
 */
function generateLegalRecommendations(
  relevantLaws: Array<{ title: string; content: string; source: string; relevance_score: number; type: string }>,
  caseType?: string
): string[] {
  const recommendations: string[] = [];

  // توصيات عامة
  recommendations.push('مراجعة القوانين واللوائح ذات الصلة بعناية');
  recommendations.push('الاستعانة بمحام متخصص في المجال');

  // توصيات حسب نوع القضية
  if (caseType) {
    if (caseType.includes('جنائي')) {
      recommendations.push('فهم حقوق المتهم في المحاكمة');
      recommendations.push('إعداد دفاع قوي بناءً على الأدلة');
    } else if (caseType.includes('تجاري')) {
      recommendations.push('مراجعة العقود والاتفاقيات');
      recommendations.push('فهم حقوق والتزامات الأطراف');
    } else if (caseType.includes('مدني')) {
      recommendations.push('توثيق جميع الأدلة والوثائق');
      recommendations.push('فهم إجراءات التقاضي المدني');
    }
  }

  // توصيات بناءً على القوانين ذات الصلة
  const highRelevanceLaws = relevantLaws.filter(law => law.relevance_score > 0.8);
  if (highRelevanceLaws.length > 0) {
    recommendations.push(`التركيز على: ${highRelevanceLaws[0].title}`);
  }

  return recommendations.slice(0, 5); // تحديد 5 توصيات كحد أقصى
}

/**
 * التحليل التنبؤي المحسن
 */
function generateEnhancedPredictiveAnalysis(
  caseType?: string,
  caseDescription?: string,
  legalContext?: any
): { success_probability: number; estimated_duration: string; complexity_score: number; key_factors: string[] } {
  let successProbability = 50; // نقطة البداية
  let complexityScore = 50;
  const keyFactors: string[] = [];

  // تحليل نوع القضية
  if (caseType) {
    if (caseType.includes('جنائي')) {
      successProbability -= 20;
      complexityScore += 30;
      keyFactors.push('قضية جنائية - تعقيد عالي');
    } else if (caseType.includes('تجاري')) {
      successProbability += 10;
      complexityScore += 15;
      keyFactors.push('قضية تجارية - تعقيد متوسط');
    } else if (caseType.includes('مدني')) {
      successProbability += 15;
      complexityScore += 10;
      keyFactors.push('قضية مدنية - تعقيد منخفض إلى متوسط');
    }
  }

  // تحليل السياق القانوني
  if (legalContext && legalContext.relevant_laws) {
    const highRelevanceCount = legalContext.relevant_laws.filter(
      (law: any) => law.relevance_score > 0.8
    ).length;
    
    if (highRelevanceCount > 0) {
      successProbability += highRelevanceCount * 5;
      keyFactors.push(`${highRelevanceCount} قانون عالي الصلة`);
    }

    // تحليل المخاطر
    if (legalContext.risk_assessment) {
      const riskLevel = legalContext.risk_assessment.level;
      if (riskLevel === 'high') {
        successProbability -= 25;
        complexityScore += 25;
        keyFactors.push('مخاطر قانونية عالية');
      } else if (riskLevel === 'medium') {
        successProbability -= 10;
        complexityScore += 15;
        keyFactors.push('مخاطر قانونية متوسطة');
      } else {
        successProbability += 10;
        keyFactors.push('مخاطر قانونية منخفضة');
      }
    }
  }

  // تحديد المدة المقدرة
  let estimatedDuration = '3-6 أشهر';
  if (complexityScore > 70) {
    estimatedDuration = '6-12 شهر';
  } else if (complexityScore < 30) {
    estimatedDuration = '1-3 أشهر';
  }

  // ضمان القيم ضمن النطاق المطلوب
  successProbability = Math.max(0, Math.min(100, successProbability));
  complexityScore = Math.max(0, Math.min(100, complexityScore));

  return {
    success_probability: successProbability,
    estimated_duration: estimatedDuration,
    complexity_score: complexityScore,
    key_factors: keyFactors.slice(0, 5) // تحديد 5 عوامل كحد أقصى
  };
}
