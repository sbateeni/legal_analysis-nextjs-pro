"use strict";(()=>{var e={};e.id=273,e.ids=[273],e.modules={2971:e=>{e.exports=import("zod")},3247:(e,t,n)=>{n.a(e,async(e,s)=>{try{n.r(t),n.d(t,{default:()=>p});var a=n(3813),r=n(154),i=n(8507),o=n(9469),l=n(7981),c=n(4901),u=n(5213),d=e([a,l]);[a,l]=d.then?(await d)():d;let m=Object.keys(o.A);function g(e){let t=.7;return(e.includes("قانون")||e.includes("قانوني"))&&(t+=.1),(e.includes("فلسطيني")||e.includes("فلسطين"))&&(t+=.1),(e.includes("محكمة")||e.includes("قضائية"))&&(t+=.1),e.length>200&&(t+=.1),Math.min(t,1)}async function p(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});try{let n=l.Tq.safeParse(e.body);if(!n.success)return t.status(400).json({code:"VALIDATION_ERROR",message:"طلب غير صالح",details:n.error.flatten()});let{message:s,apiKey:o,conversationHistory:d=[],context:p}=n.data,f=(0,r.jZ)(s),h=(p?.previousAnalysis||"").slice(-256),y=(0,c.uE)({message:f,caseType:p?.caseType,currentStage:p?.currentStage,previousAnalysisHash:h}),w=(0,c.lq)(y);if(w)return t.status(200).json(w);let $=(0,i.Eb)(o);if(!$.allowed)return t.status(429).json({code:"RATE_LIMIT_EXCEEDED",message:`تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد ${Math.ceil(($.resetTime-Date.now())/1e3)} ثانية`});let x=function(e,t,n){let s=n?`
السياق الحالي:
- نوع القضية: ${n.caseType||"غير محدد"}
- المرحلة الحالية: ${n.currentStage||"لم تبدأ بعد"}
- التحليل السابق: ${n.previousAnalysis?"متوفر":"غير متوفر"}
`:"",a=t.length>0?`
المحادثة السابقة:
${t.slice(-5).map(e=>`${"user"===e.role?"المستخدم":"المساعد"}: ${e.content}`).join("\n")}
`:"",r=m.length?`
منهجية العمل (12 مرحلة فلسطينية):
- ${m.join("\n- ")}
`:"",i=`
أخرج نتيجتك حصراً بصيغة JSON صالحة وفق المخطط التالي دون أي نص إضافي خارج JSON:
{
  "answer": string,              // إجابة نصية عربية فصحى
  "suggestions": string[],       // حتى 5 اقتراحات قصيرة
  "nextSteps": string[],         // حتى 5 خطوات عملية قصيرة
  "confidence": number           // بين 0 و 1
}
`;return`
أنت مساعد قانوني فلسطيني متخصص حصراً بالقوانين والأنظمة الفلسطينية وما يقدمه المستشار القانوني في فلسطين. أي إجابة يجب أن تكون ضمن الإطار القانوني الفلسطيني فقط.

${s}
${r}
${a}

${i}
رسالة المستخدم: ${e}

تعليمات صارمة:
1. أجب باللغة العربية الفصحى وبلغة مهنية واضحة.
2. التزم حصراً بما هو نافذ ومُطبَّق في القضاء الفلسطيني (التشريعات واللوائح والقرارات القضائية النافذة في فلسطين). لا تذكر قوانين غير مطبّقة في فلسطين.
3. عند الإمكان، اذكر المراجع القانونية الفلسطينية أو النصوص النافذة المعمول بها في فلسطين (اسم القانون، رقم/عنوان المادة، الجهة القضائية أو السنة).
4. اربط الإجابة بمنهجية المراحل الاثنتي عشرة أعلاه: حدد المرحلة/المراحل ذات الصلة صراحة (مثال: "المرحلة الثالثة: تحليل النصوص القانونية").
5. تحقّق من صحة أي معلومة قانونية قبل عرضها؛ إن لم تتوفر معلومة مؤكَّدة فاذكر حدود المعرفة أو اطلب معلومات إضافية بدلاً من التخمين.
6. لا تقدّم معلومات مضللة، وميّز بين الرأي القانوني العام والمتطلبات الإجرائية الرسمية.
7. إخلاء مسؤولية: هذه المعلومات للتثقيف والدعم وليست بديلاً عن استشارة محامٍ مرخّص في فلسطين عند الحاجة.
`}(f,d,p),z=new a.GoogleGenerativeAI(o).getGenerativeModel({model:"gemini-1.5-flash"}),A=await z.generateContent(x),v=(await A.response).text(),E=null;try{let e=JSON.parse(v);E=l.sb.parse(e)}catch{E={answer:v,suggestions:function(e){let t=[];return[/اقترح\s+(.+?)(?=\n|$)/g,/يمكنك\s+(.+?)(?=\n|$)/g,/يُنصح\s+(.+?)(?=\n|$)/g,/من الأفضل\s+(.+?)(?=\n|$)/g].forEach(n=>{let s=e.match(n);s&&t.push(...s.map(e=>e.replace(/^(اقترح|يمكنك|يُنصح|من الأفضل)\s+/,"")))}),t.slice(0,3)}(v),nextSteps:function(e){let t=[];return[/الخطوة\s+\d+[:\s]+(.+?)(?=\n|$)/g,/أولاً\s+(.+?)(?=\n|$)/g,/ثانياً\s+(.+?)(?=\n|$)/g,/ثالثاً\s+(.+?)(?=\n|$)/g].forEach(n=>{let s=e.match(n);s&&t.push(...s.map(e=>e.replace(/^(الخطوة\s+\d+[:\s]+|أولاً\s+|ثانياً\s+|ثالثاً\s+)/,"")))}),t.slice(0,3)}(v),confidence:g(v)}}(0,u.B)(E.answer)||(E.answer="أعتذر، هذا السؤال أو جزء من الإجابة يبدو خارج نطاق ما هو نافذ ومطبّق في القضاء الفلسطيني. يرجى إعادة صياغة السؤال ضمن الإطار القانوني الفلسطيني.",E.suggestions=[],E.nextSteps=[],E.confidence=.4),E.answer=(0,u.a)(E.answer);let S={message:E.answer,suggestions:E.suggestions||[],nextSteps:E.nextSteps||[],confidence:"number"==typeof E.confidence?E.confidence:g(E.answer),timestamp:Date.now()};return(0,c.$N)(y,S),t.status(200).json(S)}catch(s){console.error("Error in chat API:",s);let e="حدث خطأ في معالجة الرسالة",n=s instanceof Error?s.message:"خطأ غير معروف";return n.includes("API_KEY")?e="مفتاح API غير صحيح أو منتهي الصلاحية":n.includes("quota")&&(e="تم استنفاذ الحد المسموح من طلبات API"),t.status(500).json({code:"API_ERROR",message:e,details:n})}}s()}catch(e){s(e)}})},3813:e=>{e.exports=import("@google/generative-ai")},4720:(e,t,n)=>{n.a(e,async(e,s)=>{try{n.r(t),n.d(t,{config:()=>u,default:()=>c,routeModule:()=>d});var a=n(3480),r=n(8667),i=n(6435),o=n(3247),l=e([o]);o=(l.then?(await l)():l)[0];let c=(0,i.M)(o,"default"),u=(0,i.M)(o,"config"),d=new a.PagesAPIRouteModule({definition:{kind:r.A.PAGES_API,page:"/api/chat",pathname:"/api/chat",bundlePath:"",filename:""},userland:o});s()}catch(e){s(e)}})},4901:(e,t,n)=>{n.d(t,{$N:()=>i,lq:()=>r,uE:()=>a});let s=new Map;function a(e){return`${e.message.slice(0,400)}|${e.caseType??""}|${e.currentStage??""}|`+(e.previousAnalysisHash??"").slice(-64)}function r(e){let t=s.get(e);return t?Date.now()>t.expiresAt?(s.delete(e),null):t.value:null}function i(e,t){if(s.set(e,{value:t,expiresAt:Date.now()+3e4}),s.size>500){let e=s.keys().next().value;e&&s.delete(e)}}},5213:(e,t,n)=>{function s(e){let t=e.replace(/\s+/g," ").trim();for(let e of["القانون المصري","للقانون المصري","القانون السعودي","للقانون السعودي","القانون الأمريكي","للقانون الأمريكي","القانون الأوروبي","للقانون الأوروبي","القانون الفرنسي","للقانون الفرنسي","US law","EU law"])if(t.includes(e))return!1;let n=["القانون الأردني","للقانون الأردني"].some(e=>t.includes(e)),s=t.includes("الأردني النافذ في فلسطين");return!n||!!s}function a(e){return e.trim()}n.d(t,{B:()=>s,a:()=>a})},5600:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},7981:(e,t,n)=>{n.a(e,async(e,s)=>{try{n.d(t,{Tq:()=>l,sb:()=>c});var a=n(2971),r=e([a]);let i=(a=(r.then?(await r)():r)[0]).z.object({role:a.z.enum(["user","assistant"]),content:a.z.string(),timestamp:a.z.number()}),o=a.z.object({caseType:a.z.string().optional(),currentStage:a.z.number().int().min(0).max(12).optional(),previousAnalysis:a.z.string().optional()}),l=a.z.object({message:a.z.string().min(3),apiKey:a.z.string().min(1),conversationHistory:a.z.array(i).optional().default([]),context:o.optional()}),c=a.z.object({answer:a.z.string().min(1),suggestions:a.z.array(a.z.string()).max(5).optional().default([]),nextSteps:a.z.array(a.z.string()).max(5).optional().default([]),confidence:a.z.number().min(0).max(1).optional()});s()}catch(e){s(e)}})}};var t=require("../../webpack-api-runtime.js");t.C(e);var n=e=>t(t.s=e),s=t.X(0,[903],()=>n(4720));module.exports=s})();