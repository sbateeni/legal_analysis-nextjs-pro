"use strict";(()=>{var e={};e.id=985,e.ids=[985],e.modules={2464:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{config:()=>c,default:()=>u,routeModule:()=>d});var r=a(3480),n=a(8667),i=a(6435),o=a(7031),l=e([o]);o=(l.then?(await l)():l)[0];let u=(0,i.M)(o,"default"),c=(0,i.M)(o,"config"),d=new r.PagesAPIRouteModule({definition:{kind:n.A.PAGES_API,page:"/api/analyze",pathname:"/api/analyze",bundlePath:"",filename:""},userland:o});s()}catch(e){s(e)}})},3813:e=>{e.exports=import("@google/generative-ai")},5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},7031:(e,t,a)=>{a.a(e,async(e,s)=>{try{a.r(t),a.d(t,{default:()=>m});var r=a(3813),n=a(154),i=a(8507),o=a(8632),l=a(9469),u=e([r]);r=(u.then?(await u)():u)[0];let p=Object.keys(l.A);async function c(e,t){if(!t)throw Error("يرجى إدخال مفتاح Gemini API الخاص بك.");let a=new r.GoogleGenerativeAI(t).getGenerativeModel({model:"gemini-1.5-flash"});try{let t=await a.generateContent(e);return(await t.response).text()}catch(t){let e=t instanceof Error?t.message:"خطأ غير معروف";if(e.includes("API_KEY"))throw Error("مفتاح API غير صحيح أو منتهي الصلاحية");if(e.includes("quota"))throw Error("تم استنفاذ الحد المسموح من طلبات API");throw Error(`خطأ في API: ${e}`)}}function d(e){let t=e.reduce((e,t)=>e+(t?.length||0),0),a=[...e];for(;t>24e3&&a.length>1;)t=(a=a.slice(1)).reduce((e,t)=>e+(t?.length||0),0);return a}function g(e){if(e&&"object"==typeof e&&"code"in e)return e;let t=e instanceof Error?e.message:"حدث خطأ غير متوقع";return{code:"API_ERROR",message:t,details:e}}async function m(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed",message:"Method not allowed"});try{let{text:a,stageIndex:s,apiKey:r,previousSummaries:u,finalPetition:m,partyRole:y}=e.body,f={text:(0,n.jZ)(a||""),stageIndex:Number(s),apiKey:r?.trim()||"",previousSummaries:u||[],finalPetition:!!m,partyRole:y},$=(0,n.OP)(f);if($)return t.status(400).json({...$,error:$.message});let h=(0,i.Eb)(f.apiKey);if(!h.allowed)return t.status(429).json({code:"RATE_LIMIT_EXCEEDED",message:`تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((h.resetTime-Date.now())/1e3)} ثانية`,error:`تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil((h.resetTime-Date.now())/1e3)} ثانية`,details:{remaining:h.remaining,resetTime:h.resetTime}});if(f.finalPetition&&-1===f.stageIndex){if(!f.previousSummaries||0===f.previousSummaries.length)return t.status(400).json({code:"VALIDATION_ERROR",message:"يرجى تحليل المراحل أولاً قبل إنشاء العريضة النهائية.",error:"يرجى تحليل المراحل أولاً قبل إنشاء العريضة النهائية."});let e=d(f.previousSummaries),a={caseType:(0,o.GL)(f.text),complexity:(0,o.Ug)(f.text),jurisdiction:"فلسطيني",language:"العربية",partyRole:f.partyRole},s=(0,o.pg)(f.text,e,a);try{let e=await c(s,f.apiKey);return t.status(200).json({stage:"العريضة النهائية",analysis:e,timestamp:Date.now(),context:a})}catch(a){let e=g(a);return t.status(500).json({code:e.code,message:e.message,error:e.message,details:e.details})}}if(f.stageIndex<0||f.stageIndex>=p.length)return t.status(400).json({code:"VALIDATION_ERROR",message:"رقم المرحلة غير صحيح",error:"رقم المرحلة غير صحيح"});let x=p[f.stageIndex],j=l.A[x];if(!j)return t.status(400).json({code:"STAGE_NOT_FOUND",message:"المرحلة غير موجودة",error:"المرحلة غير موجودة"});let I=(0,i.Tg)(f.text,f.stageIndex);if(I)return t.status(200).json({stage:x,analysis:I,timestamp:Date.now(),cached:!0});let R=d(f.previousSummaries||[]),w={caseType:(0,o.GL)(f.text),complexity:(0,o.Ug)(f.text),jurisdiction:"فلسطيني",language:"العربية",partyRole:f.partyRole},A=(0,o.rs)(j,f.text,R,w);try{let e=await c(A,f.apiKey);(0,i.z4)(f.text,f.stageIndex,e);let a={stage:x,analysis:e,timestamp:Date.now(),stageIndex:f.stageIndex};return t.status(200).json(a)}catch(a){let e=g(a);return t.status(500).json({code:e.code,message:e.message,error:e.message,details:e.details})}}catch(a){console.error("Error in analyze API:",a);let e=g(a);return t.status(500).json({code:e.code,message:e.message,error:e.message,details:e.details})}}s()}catch(e){s(e)}})},8632:(e,t,a)=>{function s(e,t,a,s){let r=s?`
السياق القانوني:
- نوع القضية: ${s.caseType||"غير محدد"}
- مستوى التعقيد: ${s.complexity||"متوسط"}
- الاختصاص: ${s.jurisdiction||"فلسطيني"}
- اللغة: ${s.language||"العربية"}
${s.partyRole?`- صفة المستخدم في الدعوى: ${s.partyRole}`:""}
`:"",n=a&&a.length>0?`
ملخص المراحل السابقة (يجب أن يُبنى التحليل الحالي عليها بشكل تراكمي ومتسلسل):
${a.map((e,t)=>`- المرحلة ${t+1}: ${e.substring(0,200)}...`).join("\n")}
`:"",i=e.examples&&e.examples.length>0?`
أمثلة على التحليل المطلوب:
${e.examples.map(e=>`• ${e}`).join("\n")}
`:"",o=e.legalReferences&&e.legalReferences.length>0?`
المراجع القانونية ذات الصلة:
${e.legalReferences.map(e=>`• ${e}`).join("\n")}
`:"";return`
أنت خبير قانوني فلسطيني محترف مع خبرة 20+ سنة في المحاكم الفلسطينية. التزم حصراً بما هو نافذ ومطبّق في القضاء الفلسطيني؛ اذكر المرجع القانوني (اسم القانون/رقم المادة) عندما يكون ممكناً.

المهمة: ${e.description}

${r}

تفاصيل القضية الأساسية:
${t}

${n}

النقاط الرئيسية للتحليل في هذه المرحلة:
${e.key_points.map(e=>"• "+e).join("\n")}

الأسئلة الرئيسية للإجابة في هذه المرحلة:
${e.questions.map(e=>"- "+e).join("\n")}

${i}

${o}

تعليمات هامة:
1. ركز على تحليل هذه المرحلة المحددة فقط
2. ابدأ تحليلك من حيث انتهت المراحل السابقة
3. لا تعيد تحليل النص الأصلي من البداية
4. اربط تحليلك بالمراحل السابقة بشكل منطقي ومتسلسل
5. قدم تحليلاً جديداً ومتخصصاً لهذه المرحلة
6. تجنب التكرار مع المراحل السابقة
7. استخدم المعلومات من المراحل السابقة كأساس للتحليل الحالي
8. تحقق من صحة المعلومات القانونية وتجنب أي لغط أو أخطاء
9. استخدم لغة قانونية رسمية ومناسبة
10. قدم تحليلاً عملياً وقابلاً للتطبيق

إن كانت صفة المستخدم محددة (${s?.partyRole??"غير محددة"}): وجّه التحليل لصالح هذه الجهة، وبيّن الحجج والإجراءات العملية لكسب الدعوى من منظورها، مع مراعاة الأصول والإجراءات.

تحليل ${e.stageName}:
`}function r(e,t,a){let s=a?`
السياق القانوني:
- نوع القضية: ${a.caseType||"غير محدد"}
- الاختصاص: ${a.jurisdiction||"فلسطيني"}
${a.partyRole?`- صفة المستخدم في الدعوى: ${a.partyRole}`:""}
`:"";return`
أنت محامٍ فلسطيني محترف مع خبرة 20+ سنة في المحاكم الفلسطينية. بناءً على التحليلات القانونية التالية، قم بصياغة عريضة قانونية نهائية رسمية وجاهزة للتقديم للمحكمة المختصة، ملتزماً حصراً بما هو نافذ ومطبّق في القضاء الفلسطيني، مع الإشارة للمراجع القانونية ذات الصلة.

${s}

تفاصيل القضية الأساسية:
${e}

التحليلات القانونية السابقة:
${t.map((e,t)=>`المرحلة ${t+1}: ${e.substring(0,300)}...`).join("\n\n")}

تعليمات صياغة العريضة:
1. ابدأ بمقدمة رسمية تذكر المحكمة المختصة والأطراف
2. اعرض الوقائع الأساسية بشكل موجز ومتسلسل
3. استخدم التحليلات السابقة كأساس للحجج القانونية
4. استشهد بالنصوص القانونية الفلسطينية أو النصوص النافذة المعمول بها في فلسطين عند الاقتضاء
5. قدم طلباتك للمحكمة بشكل واضح ومهني
6. تجنب التكرار مع التحليلات السابقة
7. ركز على صياغة وثيقة قانونية رسمية
8. استخدم لغة قانونية رسمية ومناسبة للمحكمة
9. تأكد من اكتمال جميع العناصر القانونية المطلوبة
10. انهي العريضة بالتوقيع والتاريخ

إن كانت صفة المستخدم محددة (${a?.partyRole??"غير محددة"}): اجعل الصياغة متسقة مع طلبات هذه الجهة (مثلاً طلب الحكم وفق مصلحة المدعي/المشتكي أو رد الدعوى عن المدعى عليه/المشتكى عليه) مع سلامة الشكل والإجراءات.

صياغة العريضة القانونية:
`}function n(e){let t=e.split(/\s+/).length,a=/قانون|محكمة|عقوبة|حقوق|التزام|عقد|ميراث|طلاق|نزاع/i.test(e),s=/إجراءات|استئناف|طعن|تنفيذ|تحكيم|وساطة/i.test(e);return t>500||s?"advanced":t>200||a?"intermediate":"basic"}function i(e){return/ميراث|ورثة|إرث/i.test(e)?"قضية ميراث":/طلاق|زواج|أحوال شخصية/i.test(e)?"قضية أحوال شخصية":/عقد|تجاري|شركة|عمل/i.test(e)?"قضية تجارية":/عقوبة|جريمة|جنحة/i.test(e)?"قضية جنائية":/أرض|عقار|ملكية/i.test(e)?"قضية عقارية":/عمل|موظف|راتب/i.test(e)?"قضية عمل":"قضية مدنية عامة"}a.d(t,{GL:()=>i,Ug:()=>n,pg:()=>r,rs:()=>s})}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=e=>t(t.s=e),s=t.X(0,[903],()=>a(2464));module.exports=s})();