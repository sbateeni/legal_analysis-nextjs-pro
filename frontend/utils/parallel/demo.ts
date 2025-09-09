/**
 * سكريبت توضيحي للنظام المتوازي الذكي
 * Demo Script for Intelligent Parallel Processing System
 */

import { IntelligentParallelSystem } from './index';

// مراحل تجريبية للتوضيح
const DEMO_STAGES = [
  'تحليل الوقائع الأساسية',
  'تحديد الأطراف القانونية', 
  'تحليل النزاع القانوني',
  'البحث عن القوانين المنطبقة',
  'تحليل السوابق القضائية',
  'تحديد الأدلة القانونية',
  'تحليل القوة القانونية',
  'تحديد نقاط الضعف',
  'صياغة الاستراتيجية القانونية',
  'تحليل المخاطر القانونية',
  'إعداد خطة المرافعة',
  'تقييم احتمالية النجاح',
  'العريضة القانونية النهائية'
];

/**
 * توضيح النظام المتوازي الذكي
 */
export async function demonstrateIntelligentParallelSystem() {
  console.log('🚀 بدء توضيح النظام المتوازي الذكي');
  
  try {
    // إنشاء نظام متوازي ذكي
    const parallelSystem = new IntelligentParallelSystem(DEMO_STAGES, {
      processing: {
        maxConcurrentStages: 3,
        enableDynamicScaling: true,
        failureHandling: 'continue',
        retryAttempts: 2,
        enableProgressTracking: true,
        enableEfficiencyMonitoring: true
      },
      resourceMonitoring: {
        enableDynamicScaling: true,
        optimizationInterval: 10 // كل 10 ثوانٍ للتوضيح
      },
      progressTracking: {
        enableDetailedTracking: true,
        alertThresholds: {
          lowEfficiency: 50,
          highErrorRate: 20,
          timeOverrun: 1.5
        }
      }
    });

    // نص تجريبي للقضية
    const demoInput = `
      قضية نزاع عقاري: المدعي يطالب بملكية قطعة أرض ورثها من والده،
      والمدعى عليه يدعي أنه اشترى الأرض بموجب عقد صحيح.
      توجد وثائق متضاربة وشهود من الطرفين.
      المطلوب تحليل قانوني شامل لتحديد الحق في الملكية.
    `;

    // مفتاح API تجريبي (يجب استبداله بمفتاح حقيقي)
    const demoApiKey = 'demo_api_key_12345';

    // معاملات إضافية
    const additionalParams = {
      partyRole: 'المدعي',
      caseType: 'مدنية',
      preferredModel: 'gemini-1.5-flash',
      caseName: 'قضية النزاع العقاري التوضيحية'
    };

    console.log('📊 بدء المعالجة المتوازية الذكية...');

    // بدء المعالجة
    const results = await parallelSystem.startIntelligentProcessing(
      demoInput,
      demoApiKey,
      additionalParams
    );

    console.log('✅ اكتملت المعالجة المتوازية!');
    console.log('📈 النتائج:', {
      totalResults: results.results.length,
      efficiency: `${results.efficiency.toFixed(1)}%`,
      completedStages: results.results.filter((r: any) => r.status === 'completed').length,
      failedStages: results.results.filter((r: any) => r.status === 'failed').length
    });

    console.log('💡 التوصيات:');
    results.recommendations.forEach((rec: any, index: any) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    // عرض إحصائيات النظام
    const systemStats = parallelSystem.getSystemStats();
    console.log('📊 إحصائيات النظام:', {
      uptime: `${Math.round(systemStats.uptime / 1000)} ثانية`,
      totalStages: systemStats.totalStages,
      efficiencyGain: `${systemStats.dependencyAnalysis.timeEfficiency.toFixed(1)}%`,
      parallelizableStages: systemStats.dependencyAnalysis.parallelizableStages,
      resourceHealth: systemStats.resourceStats.currentMetrics
    });

    // تصدير تقرير شامل
    const systemReport = parallelSystem.exportSystemReport();
    console.log('📋 تم إنشاء تقرير النظام الشامل');

    return {
      success: true,
      results: results.results,
      efficiency: results.efficiency,
      recommendations: results.recommendations,
      systemStats,
      systemReport
    };

  } catch (error) {
    console.error('❌ خطأ في توضيح النظام المتوازي:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    };
  }
}

/**
 * توضيح مكونات النظام المتوازي
 */
export function demonstrateParallelComponents() {
  console.log('🔧 توضيح مكونات النظام المتوازي');
  
  // 1. محلل الاعتماديات
  console.log('📊 1. محلل الاعتماديات:');
  console.log('   - يحلل الاعتماديات بين المراحل');
  console.log('   - يحدد المراحل التي يمكن تشغيلها بالتوازي');
  console.log('   - يحسب المسار الحرج والوقت المقدر');

  // 2. محرك المعالجة المتوازية
  console.log('⚡ 2. محرك المعالجة المتوازية:');
  console.log('   - ينفذ المراحل بالتوازي حسب الاعتماديات');
  console.log('   - يدير timeout وإعادة المحاولة');
  console.log('   - يوفر تحكم ديناميكي في التزامن');

  // 3. متتبع التقدم المتقدم
  console.log('📈 3. متتبع التقدم المتقدم:');
  console.log('   - يراقب التقدم بتفصيل دقيق');
  console.log('   - يحسب مقاييس الكفاءة والأداء');
  console.log('   - ينشئ تنبيهات ذكية');

  // 4. مدير الموارد الديناميكي
  console.log('🔄 4. مدير الموارد الديناميكي:');
  console.log('   - يراقب استخدام الموارد');
  console.log('   - يحسن التزامن ديناميكياً');
  console.log('   - يقدم توصيات للتحسين');

  // 5. معالج الأخطاء والاستعادة
  console.log('🛡️ 5. معالج الأخطاء والاستعادة:');
  console.log('   - يكتشف أنماط الأخطاء');
  console.log('   - يطبق استراتيجيات استعادة ذكية');
  console.log('   - يتعلم من الأخطاء السابقة');

  console.log('✨ النظام المتوازي الذكي جاهز للاستخدام!');
}

/**
 * اختبار سريع للأداء
 */
export async function quickPerformanceTest() {
  console.log('⚡ اختبار سريع للأداء');
  
  const startTime = Date.now();
  
  // محاكاة تشغيل متسلسل
  console.log('🔄 محاكاة التشغيل المتسلسل...');
  const sequentialTime = DEMO_STAGES.length * 1000; // ثانية واحدة لكل مرحلة
  
  // محاكاة تشغيل متوازي
  console.log('⚡ محاكاة التشغيل المتوازي...');
  const maxConcurrency = 3;
  const parallelTime = Math.ceil(DEMO_STAGES.length / maxConcurrency) * 1000;
  
  const endTime = Date.now();
  const testDuration = endTime - startTime;
  
  console.log('📊 نتائج اختبار الأداء:');
  console.log(`   - الوقت المتسلسل المقدر: ${sequentialTime / 1000} ثانية`);
  console.log(`   - الوقت المتوازي المقدر: ${parallelTime / 1000} ثانية`);
  console.log(`   - التحسن المتوقع: ${((sequentialTime - parallelTime) / sequentialTime * 100).toFixed(1)}%`);
  console.log(`   - وقت الاختبار: ${testDuration} ميلي ثانية`);
  
  return {
    sequentialTime,
    parallelTime,
    improvement: (sequentialTime - parallelTime) / sequentialTime * 100,
    testDuration
  };
}

// تشغيل التوضيحات عند استدعاء الملف مباشرة
if (typeof window === 'undefined' && require.main === module) {
  console.log('🎬 بدء التوضيحات التفاعلية للنظام المتوازي الذكي\n');
  
  demonstrateParallelComponents();
  console.log('\n' + '='.repeat(50) + '\n');
  
  quickPerformanceTest().then(() => {
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('💡 لتشغيل التوضيح الكامل، استخدم:');
    console.log('   demonstrateIntelligentParallelSystem()');
    console.log('\n🎉 انتهت التوضيحات!');
  });
}