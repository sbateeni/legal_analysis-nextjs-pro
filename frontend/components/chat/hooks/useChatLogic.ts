import { useState, useRef, useEffect, useCallback } from 'react';
import { getAllCases, LegalCase, loadApiKey } from '@utils/db';
import { loadAppSettings } from '@utils/appSettings';
import { PalestinianPromptTemplates } from '@utils/prompts';
import { extractApiError, mapApiErrorToMessage } from '@utils/errors';
import { ChatMessage, AnalyticsData, StrategyPayload } from '../types';
import { analyzeCases, determineCaseType } from '../utils';

export function useChatLogic() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const controllerRef = useRef<AbortController | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [preferredModel, setPreferredModel] = useState<string>('gemini-1.5-flash');
  const [chatMode, setChatMode] = useState<'legal' | 'general'>('legal');
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const CHAT_STORAGE_KEY_PREFIX = 'legal_chat_';

  // دالة تحميل التحليلات
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const allCases = await getAllCases();
      setCases(allCases);
      
      // تحليل البيانات
      const analyticsData = analyzeCases(allCases);
      setAnalytics(analyticsData);
      
    } catch (err: unknown) {
      console.error('Analytics fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في تحليل البيانات';
      setError(errorMessage);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // دالة بناء سياق القضية
  const buildCaseContext = useCallback(() => {
    const selected = cases.find(c => c.id === selectedCaseId);
    if (!selected) return undefined;
    const sortedStages = [...selected.stages].sort((a, b) => a.stageIndex - b.stageIndex);
    const previousAnalysis = sortedStages
      .map(s => `مرحلة ${s.stageIndex + 1}: ${s.stage}\n${s.output}`)
      .join('\n\n');
    const MAX_CHARS = 20000;
    const trimmed = previousAnalysis.length > MAX_CHARS ? previousAnalysis.slice(-MAX_CHARS) : previousAnalysis;
    
    // تحليل ذكي لنوع القضية بناءً على المحادثة الأخيرة
    const lastMessage = messages[messages.length - 1];
    const conversationText = lastMessage?.content || selected.stages?.[0]?.input || selected.name || '';
    const smartCaseType = determineCaseType(conversationText);
    
    // التحليل التنبؤي للقضية
    const predictiveAnalysis = analytics?.predictiveAnalyses?.find(a => a.caseId === selectedCaseId);
    
    // السياق القانوني المحسن
    const legalContext = {
      caseType: smartCaseType,
      complexityScore: predictiveAnalysis?.complexityScore || 0,
      riskLevel: predictiveAnalysis?.riskLevel || 'low',
      successProbability: predictiveAnalysis?.successProbability || 0,
      estimatedDuration: predictiveAnalysis?.estimatedDuration || 'غير محدد',
      strengths: predictiveAnalysis?.strengths || [],
      weaknesses: predictiveAnalysis?.weaknesses || [],
      recommendations: predictiveAnalysis?.recommendations || [],
      mostCommonIssues: analytics?.mostCommonIssues || []
    };
    
    return {
      caseType: selected.name,
      currentStage: sortedStages.length,
      previousAnalysis: trimmed,
      legalContext,
      analytics: {
        totalCases: analytics?.totalCases || 0,
        successRate: analytics?.successRate || 0,
        averageStagesCompleted: analytics?.averageStagesCompleted || 0,
        topStages: analytics?.topStages || [],
        commonIssues: analytics?.mostCommonIssues || []
      },
      conversationContext: conversationText
    };
  }, [selectedCaseId, cases, analytics, messages]);

  // دالة إرسال الرسالة
  const sendMessage = useCallback(async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? inputMessage).trim();
    if (!messageToSend || !apiKey.trim()) {
      setError('يرجى إعداد مفتاح API من الإعدادات ثم إرسال الرسالة');
      return;
    }

    // كاش محلي دلالي بسيط: إعادة استخدام إجابة سابقة لنفس السؤال ضمن نفس المحادثة
    const normalized = messageToSend.replace(/\s+/g, ' ').trim().toLowerCase();
    const findCachedAnswer = (): string | null => {
      for (let i = messages.length - 1; i >= 1; i--) {
        const m = messages[i - 1];
        const a = messages[i];
        if (m.role === 'user' && a.role === 'assistant') {
          const nm = m.content.replace(/\s+/g, ' ').trim().toLowerCase();
          if (nm === normalized) {
            return a.content;
          }
        }
      }
      return null;
    };
    const cachedAnswer = findCachedAnswer();
    if (!overrideMessage && cachedAnswer) {
      // أضف السؤال والجواب مباشرة دون استدعاء الشبكة
      const userMessage: ChatMessage = { role: 'user', content: messageToSend, timestamp: Date.now() };
      const assistantMessage: ChatMessage = { role: 'assistant', content: cachedAnswer, timestamp: Date.now() } as ChatMessage;
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setLastUserMessage(messageToSend);
      setInputMessage('');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(messageToSend);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // إعداد الإيقاف
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch {}
      }
      controllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-model': preferredModel,
          'x-mode': chatMode,
        },
        body: JSON.stringify({
          message: messageToSend,
          apiKey: apiKey.trim(),
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          context: buildCaseContext()
        }),
        signal: controllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        const { code, message } = extractApiError(response, data);
        throw new Error(mapApiErrorToMessage(code, message));
      }

      const ENABLE_PROGRESSIVE_DISPLAY = true;
      if (ENABLE_PROGRESSIVE_DISPLAY) {
        const baseMsg: ChatMessage = {
          role: 'assistant',
          content: '',
          timestamp: data.timestamp,
          suggestions: data.suggestions,
          nextSteps: data.nextSteps,
          confidence: data.confidence
        };
        setMessages(prev => [...prev, baseMsg]);
        const full = String(data.message || '');
        let i = 0;
        const step = Math.max(20, Math.floor(full.length / 50));
        const interval = setInterval(() => {
          i = Math.min(full.length, i + step);
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: full.slice(0, i) };
            return copy;
          });
          if (i >= full.length) clearInterval(interval);
        }, 20);
      } else {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: data.timestamp,
          suggestions: data.suggestions,
          nextSteps: data.nextSteps,
          confidence: data.confidence,
          legalSources: data.legalSources
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'name' in err && (err as { name?: string }).name === 'AbortError') {
        setError('تم إيقاف الطلب');
      } else {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, apiKey, messages, preferredModel, chatMode, buildCaseContext]);

  // دالة إيقاف الطلب
  const handleStop = useCallback(() => {
    try { controllerRef.current?.abort(); } catch {}
  }, []);

  // دالة إعادة توليد
  const handleRegenerate = useCallback(() => {
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  // دالة حفظ الاستراتيجية
  const handleSaveStrategy = useCallback(async () => {
    if (!apiKey) {
      setError('يرجى إعداد مفتاح API أولاً');
      return;
    }
    if (!messages.length) {
      setError('لا توجد محادثة لحفظها');
      return;
    }
    try {
      setSaving(true);
      const summaryPrompt = 'لخص الاستراتيجية القانونية بشكل مجرد دون أي أسماء أو بيانات شخصية: عنوان مختصر للخطة + 4-6 خطوات + أساس قانوني (مصادر/مواد إن أمكن) + وسوم. أعد فقط JSON بالمفاتيح: strategy_title, strategy_steps[], legal_basis[{source, article}], tags[]';
      await sendMessage(summaryPrompt);
      setTimeout(async () => {
        const last = messages[messages.length - 1];
        if (!last || last.role !== 'assistant') { setSaving(false); return; }
        let payload: StrategyPayload | null = null;
        try { payload = JSON.parse(last.content) as StrategyPayload; } catch {}
        const record = {
          id: `kb-${Date.now()}`,
          topic: (payload?.strategy_title) || 'خطة قانونية من المحادثة',
          jurisdiction: 'PS',
          strategy_title: (payload?.strategy_title) || 'خطة قانونية',
          strategy_steps: (payload?.strategy_steps) || ['خطوة 1','خطوة 2'],
          legal_basis: (payload?.legal_basis) || [],
          patterns: [],
          risk_notes: [],
          citations: [],
          tags: (payload?.tags) || ['محادثة','استراتيجية'],
          reviewed: false,
          createdAt: new Date().toISOString(),
        };
        await fetch('/api/legal-kb', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) });
        setSaving(false);
      }, 1200);
    } catch {
      setSaving(false);
    }
  }, [apiKey, messages.length, sendMessage, messages]);

  // دالة نسخ النص
  const copyToClipboard = useCallback(async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof index === 'number') {
        setCopiedMessageIndex(index);
        setTimeout(() => setCopiedMessageIndex(null), 1500);
      }
    } catch {}
  }, []);

  // دالة نسخ المحادثة
  const copyTranscript = useCallback(() => {
    const transcript = messages.map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`).join('\n\n');
    copyToClipboard(transcript);
  }, [messages, copyToClipboard]);

  // دالة حذف المحادثة
  const clearChat = useCallback(() => {
    if (messages.length === 0) return;
    
    const caseName = selectedCaseId ? cases.find(c => c.id === selectedCaseId)?.name : 'العامة';
    const confirmMessage = `هل أنت متأكد من حذف المحادثة الحالية حول "${caseName}"؟\n\nهذا الإجراء سيحذف ${messages.length} رسالة ولا يمكن التراجع عنه.`;
    
    if (window.confirm(confirmMessage)) {
      setMessages([]);
      setLastUserMessage('');
      setCopiedMessageIndex(null);
      
      // حذف المحادثة من التخزين المحلي
      const key = `${CHAT_STORAGE_KEY_PREFIX}${selectedCaseId || 'general'}`;
      try {
        localStorage.removeItem(key);
      } catch {
        // تجاهل أخطاء التخزين
      }
    }
  }, [messages.length, selectedCaseId, cases]);

  // دالة فحص المراجع
  const handleReferenceCheck = useCallback(() => {
    const s = cases.find(c => c.id === selectedCaseId)?.stages || [];
    if (!s.length) return setError('لا توجد مخرجات سابقة لفحص المراجع');
    const recent = s[s.length - 1].output || '';
    setInputMessage(prev => `${prev}\n\n[مرجع] تحقق من المراجع القانونية المذكورة وبيّن مدى دقتها وأحدثيتها، وصحّح إن لزم:\n${recent.slice(0, 4000)}`);
  }, [selectedCaseId, cases, setInputMessage, setError]);

  // Quick prompt template helpers
  const applyFactualExtraction = useCallback(() => {
    const base = inputMessage.trim() || lastUserMessage || '';
    setInputMessage(PalestinianPromptTemplates.factualExtraction(base || 'اكتب هنا النص المراد استخراج وقائعه...'));
  }, [inputMessage, lastUserMessage, setInputMessage]);

  const applyLegalBasis = useCallback(() => {
    const topic = inputMessage.trim() || lastUserMessage || 'موضوع قانوني محدد';
    setInputMessage(PalestinianPromptTemplates.legalBasisPS(topic));
  }, [inputMessage, lastUserMessage, setInputMessage]);

  const applyPleadingSkeleton = useCallback(() => {
    const ctx = inputMessage.trim() || lastUserMessage || 'سياق مختصر للقضية';
    setInputMessage(PalestinianPromptTemplates.pleadingSkeleton(ctx));
  }, [inputMessage, lastUserMessage, setInputMessage]);

  // Enhanced prompt templates with analytics
  const applyAnalyticsInsights = useCallback(() => {
    const context = buildCaseContext();
    if (!context?.legalContext) {
      setInputMessage('لا توجد بيانات تحليلية متاحة حالياً. يرجى اختيار قضية أولاً.');
      return;
    }
    
    const { legalContext, analytics } = context;
    const prompt = `بناءً على التحليل المتقدم للقضية، أود منك أن تقدم تحليلاً شاملاً يتضمن:

📊 **البيانات التحليلية المتاحة:**
- نوع القضية: ${legalContext.caseType}
- درجة التعقيد: ${legalContext.complexityScore}%
- مستوى المخاطر: ${legalContext.riskLevel}
- احتمالية النجاح: ${legalContext.successProbability}%
- المدة المتوقعة: ${legalContext.estimatedDuration}

🎯 **نقاط القوة:**
${legalContext.strengths.map(s => `• ${s}`).join('\n')}

⚠️ **نقاط الضعف:**
${legalContext.weaknesses.map(w => `• ${w}`).join('\n')}

💡 **التوصيات:**
${legalContext.recommendations.map(r => `• ${r}`).join('\n')}

📈 **الإحصائيات العامة:**
- إجمالي القضايا: ${analytics.totalCases}
- معدل النجاح العام: ${analytics.successRate}%
- متوسط الإنجاز: ${analytics.averageStagesCompleted}%

🔍 **المشاكل الشائعة في القضايا:**
${legalContext.mostCommonIssues.map(i => `• ${i}`).join('\n')}

يرجى تحليل هذه البيانات وتقديم رؤى قانونية استراتيجية مبنية على هذه المعلومات.`;
    
    setInputMessage(prompt);
  }, [buildCaseContext, setInputMessage]);

  const applyRiskAssessment = useCallback(() => {
    const context = buildCaseContext();
    if (!context?.legalContext) {
      setInputMessage('لا توجد بيانات تحليلية متاحة حالياً. يرجى اختيار قضية أولاً.');
      return;
    }
    
    const { legalContext } = context;
    const prompt = `أود منك إجراء تقييم شامل للمخاطر للقضية الحالية بناءً على البيانات التالية:

🔍 **معلومات القضية:**
- نوع القضية: ${legalContext.caseType}
- درجة التعقيد: ${legalContext.complexityScore}%
- مستوى المخاطر الحالي: ${legalContext.riskLevel}
- احتمالية النجاح: ${legalContext.successProbability}%

يرجى تحليل:
1. العوامل التي تزيد من المخاطر
2. استراتيجيات تقليل المخاطر
3. خطة عمل للتعامل مع التحديات
4. مؤشرات الأداء للمراقبة
5. سيناريوهات بديلة في حالة عدم النجاح`;
    
    setInputMessage(prompt);
  }, [buildCaseContext, setInputMessage]);

  const applyStrategicAnalysis = useCallback(() => {
    const context = buildCaseContext();
    if (!context?.legalContext) {
      setInputMessage('لا توجد بيانات تحليلية متاحة حالياً. يرجى اختيار قضية أولاً.');
      return;
    }
    
    const { legalContext, analytics } = context;
    const prompt = `بناءً على التحليل الاستراتيجي المتقدم، أود منك وضع خطة استراتيجية شاملة تتضمن:

📋 **التحليل الحالي:**
- نوع القضية: ${legalContext.caseType}
- المرحلة الحالية: ${context.currentStage}
- درجة التعقيد: ${legalContext.complexityScore}%
- احتمالية النجاح: ${legalContext.successProbability}%

🎯 **الاستراتيجية المطلوبة:**
1. تحليل نقاط القوة والاستفادة منها
2. معالجة نقاط الضعف
3. خطة زمنية واقعية
4. موارد مطلوبة
5. مؤشرات النجاح
6. خطة الطوارئ

📊 **المراجع التحليلية:**
- معدل النجاح العام: ${analytics.successRate}%
- المراحل الأكثر نجاحاً: ${analytics.topStages.map(s => s.stage).join(', ')}
- المشاكل الشائعة التي يجب تجنبها

يرجى تقديم خطة مفصلة وقابلة للتطبيق.`;
    
    setInputMessage(prompt);
  }, [buildCaseContext, setInputMessage]);

  // دالة التحليل التلقائي الذكي
  const applyAutoAnalysis = useCallback(() => {
    const context = buildCaseContext();
    if (!context?.legalContext) {
      setInputMessage('يرجى إدخال تفاصيل القضية أولاً لبدء التحليل التلقائي الذكي.');
      return;
    }
    
    const { legalContext, analytics } = context;
    const prompt = `بناءً على تحليل ذكي للقضية، أود منك إجراء تحليل تلقائي شامل لجميع المراحل القانونية. 

🔍 **التحليل الذكي المحدد:**
- نوع القضية المكتشف: ${legalContext.caseType}
- درجة التعقيد: ${legalContext.complexityScore}%
- احتمالية النجاح: ${legalContext.successProbability}%
- مستوى المخاطر: ${legalContext.riskLevel}

🚀 **التحليل التلقائي المطلوب:**

**المرحلة 1:** تحليل الوقائع الأساسية
**المرحلة 2:** تحديد الأطراف القانونية  
**المرحلة 3:** تحليل النزاع القانوني
**المرحلة 4:** البحث عن القوانين المنطبقة
**المرحلة 5:** تحليل السوابق القضائية
**المرحلة 6:** تحديد الأدلة القانونية
**المرحلة 7:** تحليل القوة القانونية
**المرحلة 8:** تحديد نقاط الضعف
**المرحلة 9:** صياغة الاستراتيجية القانونية
**المرحلة 10:** تحليل المخاطر القانونية
**المرحلة 11:** إعداد خطة المرافعة
**المرحلة 12:** تقييم احتمالية النجاح

🎯 **التخصيص المطلوب:**
- ركز على القوانين الفلسطينية المناسبة لنوع القضية (${legalContext.caseType})
- استخدم المراجع القانونية المتخصصة
- طبق المعايير القانونية المناسبة
- قدم توصيات عملية مخصصة

📊 **المراجع التحليلية:**
- معدل النجاح العام: ${analytics.successRate}%
- المراحل الأكثر نجاحاً: ${analytics.topStages.map(s => s.stage).join(', ')}
- المشاكل الشائعة: ${analytics.commonIssues.join(', ')}

يرجى تحليل كل مرحلة بشكل منفصل ومفصل، مع التركيز على التخصص القانوني المناسب.`;
    
    setInputMessage(prompt);
  }, [buildCaseContext, setInputMessage]);

  return {
    // State
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isLoading,
    apiKey,
    setApiKey,
    error,
    setError,
    cases,
    setCases,
    selectedCaseId,
    setSelectedCaseId,
    lastUserMessage,
    setLastUserMessage,
    copiedMessageIndex,
    setCopiedMessageIndex,
    preferredModel,
    setPreferredModel,
    chatMode,
    setChatMode,
    saving,
    setSaving,
    analytics,
    setAnalytics,
    analyticsLoading,
    setAnalyticsLoading,
    showAnalytics,
    setShowAnalytics,
    controllerRef,
    CHAT_STORAGE_KEY_PREFIX,
    
    // Functions
    fetchAnalytics,
    buildCaseContext,
    sendMessage,
    handleStop,
    handleRegenerate,
    handleSaveStrategy,
    copyToClipboard,
    copyTranscript,
    clearChat,
    handleReferenceCheck,
    applyFactualExtraction,
    applyLegalBasis,
    applyPleadingSkeleton,
    applyAnalyticsInsights,
    applyRiskAssessment,
    applyStrategicAnalysis,
    applyAutoAnalysis
  };
}
