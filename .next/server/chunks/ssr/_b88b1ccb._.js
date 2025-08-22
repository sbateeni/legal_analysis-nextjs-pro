module.exports = {

"[project]/utils/db.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "addCase": (()=>addCase),
    "addStageToCase": (()=>addStageToCase),
    "addTemplate": (()=>addTemplate),
    "clearAllCases": (()=>clearAllCases),
    "deleteCase": (()=>deleteCase),
    "deleteStageFromCase": (()=>deleteStageFromCase),
    "deleteTemplate": (()=>deleteTemplate),
    "getAllCases": (()=>getAllCases),
    "getAllTemplates": (()=>getAllTemplates),
    "getCaseById": (()=>getCaseById),
    "loadApiKey": (()=>loadApiKey),
    "saveAllCases": (()=>saveAllCases),
    "saveAllTemplates": (()=>saveAllTemplates),
    "saveApiKey": (()=>saveApiKey),
    "updateCase": (()=>updateCase),
    "updateStageInCase": (()=>updateStageInCase),
    "updateTemplate": (()=>updateTemplate)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb-keyval/dist/index.js [ssr] (ecmascript)");
;
// مفاتيح التخزين
const CASES_KEY = 'legal_cases';
const API_KEY = 'gemini_api_key';
const TEMPLATES_KEY = 'legal_templates';
async function saveApiKey(apiKey) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["set"])(API_KEY, apiKey);
}
async function loadApiKey() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["get"])(API_KEY) || '';
}
async function getAllCases() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["get"])(CASES_KEY) || [];
}
async function saveAllCases(cases) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["set"])(CASES_KEY, cases);
}
async function addCase(newCase) {
    const cases = await getAllCases();
    cases.unshift(newCase);
    await saveAllCases(cases);
}
async function updateCase(updatedCase) {
    let cases = await getAllCases();
    cases = cases.map((c)=>c.id === updatedCase.id ? updatedCase : c);
    await saveAllCases(cases);
}
async function deleteCase(caseId) {
    let cases = await getAllCases();
    cases = cases.filter((c)=>c.id !== caseId);
    await saveAllCases(cases);
}
async function getCaseById(caseId) {
    const cases = await getAllCases();
    return cases.find((c)=>c.id === caseId);
}
async function addStageToCase(caseId, stage) {
    const cases = await getAllCases();
    const idx = cases.findIndex((c)=>c.id === caseId);
    if (idx === -1) return;
    cases[idx].stages.push(stage);
    await saveAllCases(cases);
}
async function updateStageInCase(caseId, stage) {
    const cases = await getAllCases();
    const idx = cases.findIndex((c)=>c.id === caseId);
    if (idx === -1) return;
    cases[idx].stages = cases[idx].stages.map((s)=>s.id === stage.id ? stage : s);
    await saveAllCases(cases);
}
async function deleteStageFromCase(caseId, stageId) {
    const cases = await getAllCases();
    const idx = cases.findIndex((c)=>c.id === caseId);
    if (idx === -1) return;
    cases[idx].stages = cases[idx].stages.filter((s)=>s.id !== stageId);
    await saveAllCases(cases);
}
async function clearAllCases() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["del"])(CASES_KEY);
}
async function getAllTemplates() {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["get"])(TEMPLATES_KEY) || [];
}
async function saveAllTemplates(templates) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["set"])(TEMPLATES_KEY, templates);
}
async function addTemplate(t) {
    const list = await getAllTemplates();
    list.unshift(t);
    await saveAllTemplates(list);
}
async function updateTemplate(t) {
    let list = await getAllTemplates();
    list = list.map((x)=>x.id === t.id ? t : x);
    await saveAllTemplates(list);
}
async function deleteTemplate(id) {
    let list = await getAllTemplates();
    list = list.filter((x)=>x.id !== id);
    await saveAllTemplates(list);
}
}}),
"[project]/components/WelcomeHeader.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>WelcomeHeader)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
;
;
;
function WelcomeHeader({ user, onLogout }) {
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
            borderRadius: 16,
            padding: '20px',
            marginBottom: 24,
            boxShadow: `0 4px 20px ${theme.accent}33`,
            border: `1px solid ${theme.accent}`,
            color: '#fff',
            textAlign: 'center'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 24,
                    fontWeight: 800,
                    marginBottom: 8
                },
                children: [
                    "🎉 مرحباً بك، ",
                    user.username,
                    "!"
                ]
            }, void 0, true, {
                fileName: "[project]/components/WelcomeHeader.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 16,
                    opacity: 0.9,
                    marginBottom: 16
                },
                children: [
                    user.role === 'admin' ? 'مدير مكتب' : 'موظف',
                    " في ",
                    user.officeId
                ]
            }, void 0, true, {
                fileName: "[project]/components/WelcomeHeader.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard",
                        style: {
                            textDecoration: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            style: {
                                background: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: 8,
                                padding: '8px 16px',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            },
                            children: "🏢 لوحة التحكم"
                        }, void 0, false, {
                            fileName: "[project]/components/WelcomeHeader.tsx",
                            lineNumber: 38,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/WelcomeHeader.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: onLogout,
                        style: {
                            background: 'rgba(239,68,68,0.2)',
                            color: '#fff',
                            border: '2px solid rgba(239,68,68,0.3)',
                            borderRadius: 8,
                            padding: '8px 16px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        },
                        children: "🚪 تسجيل الخروج"
                    }, void 0, false, {
                        fileName: "[project]/components/WelcomeHeader.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WelcomeHeader.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/WelcomeHeader.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/AuthCallToAction.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AuthCallToAction)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
;
;
;
function AuthCallToAction() {
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
            borderRadius: 16,
            padding: '32px',
            marginBottom: 24,
            boxShadow: `0 4px 20px ${theme.accent}33`,
            border: `1px solid ${theme.accent}`,
            textAlign: 'center',
            color: '#fff'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 28,
                    fontWeight: 800,
                    marginBottom: 16
                },
                children: "🚀 منصة التحليل القانوني الذكي"
            }, void 0, false, {
                fileName: "[project]/components/AuthCallToAction.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: 18,
                    opacity: 0.9,
                    marginBottom: 24,
                    lineHeight: 1.6
                },
                children: [
                    "انضم إلينا واحصل على تحليل قانوني متقدم في 12 مرحلة",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("br", {}, void 0, false, {
                        fileName: "[project]/components/AuthCallToAction.tsx",
                        lineNumber: 23,
                        columnNumber: 60
                    }, this),
                    "مع عريضة قانونية نهائية جاهزة للمحكمة"
                ]
            }, void 0, true, {
                fileName: "[project]/components/AuthCallToAction.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/login",
                        style: {
                            textDecoration: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            style: {
                                background: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: 12,
                                padding: '16px 32px',
                                fontSize: 18,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(10px)'
                            },
                            children: "🔐 تسجيل الدخول"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthCallToAction.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AuthCallToAction.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/register",
                        style: {
                            textDecoration: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            style: {
                                background: 'rgba(255,255,255,0.9)',
                                color: theme.accent,
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: 12,
                                padding: '16px 32px',
                                fontSize: 18,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            },
                            children: "🚀 إنشاء حساب جديد"
                        }, void 0, false, {
                            fileName: "[project]/components/AuthCallToAction.tsx",
                            lineNumber: 44,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/AuthCallToAction.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/AuthCallToAction.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AuthCallToAction.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
}}),
"[project]/pages/index.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/db.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb-keyval/dist/index.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/crypto.ts [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WelcomeHeader$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WelcomeHeader.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthCallToAction$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AuthCallToAction.tsx [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
const STAGES = [
    'المرحلة الأولى: تحديد المشكلة القانونية',
    'المرحلة الثانية: جمع المعلومات والوثائق',
    'المرحلة الثالثة: تحليل النصوص القانونية',
    'المرحلة الرابعة: تحديد القواعد القانونية المنطبقة',
    'المرحلة الخامسة: تحليل السوابق القضائية',
    'المرحلة السادسة: تحليل الفقه القانوني',
    'المرحلة السابعة: تحليل الظروف الواقعية',
    'المرحلة الثامنة: تحديد الحلول القانونية الممكنة',
    'المرحلة التاسعة: تقييم الحلول القانونية',
    'المرحلة العاشرة: اختيار الحل الأمثل',
    'المرحلة الحادية عشرة: صياغة الحل القانوني',
    'المرحلة الثانية عشرة: تقديم التوصيات'
];
const FINAL_STAGE = 'المرحلة الثالثة عشرة: العريضة القانونية النهائية';
const ALL_STAGES = [
    ...STAGES,
    FINAL_STAGE
];
function Home() {
    const { theme, darkMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [apiKey, setApiKey] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [caseNameInput, setCaseNameInput] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [showInstallPrompt, setShowInstallPrompt] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [deferredPrompt, setDeferredPrompt] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('input');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [isSmallScreen, setIsSmallScreen] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const prevApiKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])("");
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // لكل مرحلة: نص، نتيجة، تحميل، خطأ، إظهار نتيجة
    const [mainText, setMainText] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [stageResults, setStageResults] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>Array(ALL_STAGES.length).fill(null));
    const [stageLoading, setStageLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>Array(ALL_STAGES.length).fill(false));
    const [stageErrors, setStageErrors] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>Array(ALL_STAGES.length).fill(null));
    const [stageShowResult, setStageShowResult] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(()=>Array(ALL_STAGES.length).fill(false));
    const [partyRole, setPartyRole] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        setMounted(true);
        // التحقق من حالة تسجيل الدخول
        const userData = localStorage.getItem('legal_user');
        const token = localStorage.getItem('legal_token') || sessionStorage.getItem('legal_token');
        if (userData && token) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // مسح البيانات التالفة
                localStorage.removeItem('legal_user');
                localStorage.removeItem('legal_token');
                sessionStorage.removeItem('legal_token');
            }
        }
        // تحميل مفتاح API من قاعدة البيانات عند بدء التشغيل
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["loadApiKey"])().then((val)=>{
            if (val) setApiKey(val);
        });
        // معالجة تثبيت التطبيق كتطبيق أيقونة
        const handleBeforeInstallPrompt = (e)=>{
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        // التحقق من وجود التطبيق مثبت
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstallPrompt(false);
        }
        // مراقبة حجم الشاشة
        const checkScreenSize = ()=>{
            setIsSmallScreen(window.innerWidth <= 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return ()=>{
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // حفظ مفتاح API في قاعدة البيانات عند تغييره
        if (apiKey) (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["saveApiKey"])(apiKey);
    }, [
        apiKey
    ]);
    // حفظ apiKey في Blob Storage عند تغييره
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (apiKey && apiKey !== prevApiKey.current) {
            prevApiKey.current = apiKey;
        }
    }, [
        apiKey
    ]);
    // دالة تثبيت التطبيق
    const handleInstallApp = async ()=>{
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowInstallPrompt(false);
                setDeferredPrompt(null);
            }
        }
    };
    // دالة تسجيل الخروج
    const handleLogout = ()=>{
        localStorage.removeItem('legal_user');
        localStorage.removeItem('legal_token');
        sessionStorage.removeItem('legal_token');
        setIsAuthenticated(false);
        setUser(null);
        window.location.reload();
    };
    // دالة بدء قضية جديدة
    const handleNewCase = ()=>{
        // مسح جميع البيانات الحالية
        setMainText('');
        setCaseNameInput('');
        setStageResults(Array(ALL_STAGES.length).fill(null));
        setStageLoading(Array(ALL_STAGES.length).fill(false));
        setStageErrors(Array(ALL_STAGES.length).fill(null));
        setStageShowResult(Array(ALL_STAGES.length).fill(false));
        setPartyRole('');
        setActiveTab('input');
    };
    // دالة تحليل مرحلة واحدة
    const handleAnalyzeStage = async (idx)=>{
        // إذا كانت المرحلة الأخيرة (العريضة النهائية)
        if (idx === ALL_STAGES.length - 1) {
            setStageLoading((arr)=>arr.map((v, i)=>i === idx ? true : v));
            setStageErrors((arr)=>arr.map((v, i)=>i === idx ? null : v));
            setStageResults((arr)=>arr.map((v, i)=>i === idx ? null : v));
            setStageShowResult((arr)=>arr.map((v, i)=>i === idx ? false : v));
            if (!apiKey) {
                setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'يرجى إعداد مفتاح Gemini API من صفحة الإعدادات أولاً.' : v));
                setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
                return;
            }
            const summaries = stageResults.slice(0, idx).filter((r)=>!!r);
            if (summaries.length === 0) {
                setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'يرجى تحليل المراحل أولاً قبل توليد العريضة النهائية.' : v));
                setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
                return;
            }
            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: mainText,
                        stageIndex: -1,
                        apiKey,
                        previousSummaries: summaries,
                        finalPetition: true,
                        partyRole: partyRole || undefined
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    setStageResults((arr)=>arr.map((v, i)=>i === idx ? data.analysis : v));
                    setTimeout(()=>setStageShowResult((arr)=>arr.map((v, i)=>i === idx ? true : v)), 100);
                } else {
                    setStageErrors((arr)=>arr.map((v, i)=>i === idx ? data.error || 'حدث خطأ أثناء توليد العريضة النهائية' : v));
                }
            } catch  {
                setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'تعذر الاتصال بالخادم' : v));
            } finally{
                setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
            }
            return;
        }
        setStageLoading((arr)=>arr.map((v, i)=>i === idx ? true : v));
        setStageErrors((arr)=>arr.map((v, i)=>i === idx ? null : v));
        setStageResults((arr)=>arr.map((v, i)=>i === idx ? null : v));
        setStageShowResult((arr)=>arr.map((v, i)=>i === idx ? false : v));
        if (!apiKey) {
            setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'يرجى إعداد مفتاح Gemini API من صفحة الإعدادات أولاً.' : v));
            setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
            return;
        }
        const text = mainText;
        if (!text.trim()) {
            setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'يرجى إدخال تفاصيل القضية.' : v));
            setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
            return;
        }
        // جمع ملخصات المراحل السابقة (النتائج غير الفارغة فقط)
        let previousSummaries = stageResults.slice(0, idx).filter((r)=>!!r);
        // حدود الطول (تقريبي: 8000 tokens ≈ 24,000 حرف)
        const MAX_CHARS = 24000;
        let totalLength = previousSummaries.reduce((acc, cur)=>acc + (cur?.length || 0), 0);
        // إذا تجاوز الطول، احذف أقدم النتائج حتى لا يتجاوز الحد
        while(totalLength > MAX_CHARS && previousSummaries.length > 1){
            previousSummaries = previousSummaries.slice(1);
            totalLength = previousSummaries.reduce((acc, cur)=>acc + (cur?.length || 0), 0);
        }
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text,
                    stageIndex: idx,
                    apiKey,
                    previousSummaries,
                    partyRole: partyRole || undefined
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStageResults((arr)=>arr.map((v, i)=>i === idx ? data.analysis : v));
                setTimeout(()=>setStageShowResult((arr)=>arr.map((v, i)=>i === idx ? true : v)), 100);
                // حفظ التحليل ضمن نفس القضية إن وُجدت، وإلا إنشاؤها
                const caseName = caseNameInput.trim() ? caseNameInput.trim() : `قضية بدون اسم - ${Date.now()}`;
                const newStage = {
                    id: `${idx}-${btoa(unescape(encodeURIComponent(text))).slice(0, 8)}-${Date.now()}`,
                    stageIndex: idx,
                    stage: ALL_STAGES[idx],
                    input: text,
                    output: data.analysis,
                    date: new Date().toISOString()
                };
                const allCases = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["getAllCases"])();
                const existing = allCases.find((c)=>c.name === caseName);
                if (existing) {
                    existing.stages.push(newStage);
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["updateCase"])(existing);
                } else {
                    const newCaseId = `${caseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["addCase"])({
                        id: newCaseId,
                        name: caseName,
                        createdAt: newStage.date,
                        stages: [
                            newStage
                        ]
                    });
                }
            } else {
                if (data.error && data.error.includes('429')) {
                    setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'لقد تجاوزت الحد المسموح به لعدد الطلبات على خدمة Gemini API. يرجى الانتظار دقيقة ثم إعادة المحاولة. إذا تكررت المشكلة، استخدم مفتاح API آخر أو راجع إعدادات حسابك في Google AI Studio.' : v));
                } else {
                    setStageErrors((arr)=>arr.map((v, i)=>i === idx ? data.error || 'حدث خطأ أثناء التحليل' : v));
                }
            }
        } catch  {
            setStageErrors((arr)=>arr.map((v, i)=>i === idx ? 'تعذر الاتصال بالخادم' : v));
        } finally{
            setStageLoading((arr)=>arr.map((v, i)=>i === idx ? false : v));
        }
    };
    if (!mounted) {
        return null; // تجنب hydration mismatch
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    fontFamily: 'Tajawal, Arial, sans-serif',
                    direction: 'rtl',
                    minHeight: '100vh',
                    background: theme.background,
                    color: theme.text,
                    padding: 0,
                    margin: 0,
                    transition: 'background 0.4s'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                        style: {
                            maxWidth: 800,
                            width: '100%',
                            margin: '0 auto',
                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '1rem 0.5rem' : '2rem 1rem'
                        },
                        children: [
                            isAuthenticated && user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WelcomeHeader$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                user: user,
                                onLogout: handleLogout
                            }, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 293,
                                columnNumber: 13
                            }, this),
                            !apiKey && isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#fffbe6',
                                    color: '#b7791f',
                                    border: '1px solid #f6ad55',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    marginBottom: 16,
                                    boxShadow: '0 1px 6px #b7791f22',
                                    fontWeight: 700,
                                    textAlign: 'center'
                                },
                                children: [
                                    "لم يتم إعداد مفتاح Gemini API بعد. انتقل إلى ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/settings",
                                        style: {
                                            color: theme.accent,
                                            textDecoration: 'underline'
                                        },
                                        children: "الإعدادات"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 309,
                                        columnNumber: 60
                                    }, this),
                                    " لإعداده."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 298,
                                columnNumber: 13
                            }, this),
                            isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: 12,
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    marginBottom: 16
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: handleNewCase,
                                        style: {
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: theme.accent2,
                                            border: `1px solid ${theme.accent2}`,
                                            borderRadius: 8,
                                            padding: isSmallScreen ? '8px 16px' : '6px 14px',
                                            fontWeight: 700,
                                            fontSize: isSmallScreen ? 14 : 16,
                                            cursor: 'pointer',
                                            boxShadow: `0 1px 4px ${theme.shadow}`,
                                            letterSpacing: 1,
                                            transition: 'all 0.2s',
                                            width: 'auto'
                                        },
                                        children: "🆕 قضية جديدة"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 316,
                                        columnNumber: 15
                                    }, this),
                                    showInstallPrompt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: handleInstallApp,
                                        style: {
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            color: '#0f766e',
                                            border: '1px solid #99f6e4',
                                            borderRadius: 8,
                                            padding: isSmallScreen ? '8px 16px' : '6px 14px',
                                            fontWeight: 700,
                                            fontSize: isSmallScreen ? 14 : 16,
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 4px #0002',
                                            letterSpacing: 1,
                                            transition: 'all 0.2s',
                                            width: 'auto'
                                        },
                                        children: "📱 تثبيت التطبيق"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 328,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 315,
                                columnNumber: 13
                            }, this) : /* دعوة للعمل للمستخدمين غير المسجلين */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AuthCallToAction$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 343,
                                columnNumber: 13
                            }, this),
                            isAuthenticated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: theme.card,
                                            borderRadius: 16,
                                            boxShadow: `0 4px 20px ${theme.shadow}`,
                                            marginBottom: 24,
                                            border: `1.5px solid ${theme.border}`,
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                background: darkMode ? '#2a2d3e' : '#f8fafc',
                                                borderBottom: `1px solid ${theme.border}`
                                            },
                                            children: [
                                                {
                                                    id: 'input',
                                                    label: '📝 إدخال البيانات',
                                                    icon: '✍️'
                                                },
                                                {
                                                    id: 'stages',
                                                    label: '🔍 مراحل التحليل',
                                                    icon: '⚖️'
                                                },
                                                {
                                                    id: 'results',
                                                    label: '📊 النتائج',
                                                    icon: '📈'
                                                }
                                            ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setActiveTab(tab.id),
                                                    style: {
                                                        flex: 1,
                                                        padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '12px 8px' : '16px 12px',
                                                        background: activeTab === tab.id ? theme.accent : 'transparent',
                                                        color: activeTab === tab.id ? '#fff' : theme.text,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                                        fontWeight: 600,
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            children: tab.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.tsx",
                                                            lineNumber: 386,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                display: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 'none' : 'inline'
                                                            },
                                                            children: tab.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/index.tsx",
                                                            lineNumber: 387,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, tab.id, true, {
                                                    fileName: "[project]/pages/index.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.tsx",
                                            lineNumber: 357,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 349,
                                        columnNumber: 15
                                    }, this),
                                    activeTab === 'input' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: theme.card,
                                                    borderRadius: 14,
                                                    boxShadow: `0 2px 12px ${theme.shadow}`,
                                                    padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 24,
                                                    marginBottom: 24,
                                                    border: `1.5px solid ${theme.border}`
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 16
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 8,
                                                                    marginBottom: 12
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            fontSize: 20
                                                                        },
                                                                        children: "📛"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 408,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                                        style: {
                                                                            fontWeight: 700,
                                                                            color: theme.accent2,
                                                                            fontSize: 16
                                                                        },
                                                                        children: "اسم القضية:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 409,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 407,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: caseNameInput,
                                                                onChange: (e)=>setCaseNameInput(e.target.value),
                                                                placeholder: "أدخل اسم القضية (مثال: قضية إيجار 2024)",
                                                                style: {
                                                                    width: '100%',
                                                                    borderRadius: 12,
                                                                    border: `2px solid ${theme.input}`,
                                                                    padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 12 : 16,
                                                                    fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                                    marginBottom: 0,
                                                                    outline: 'none',
                                                                    boxShadow: `0 2px 8px ${theme.shadow}`,
                                                                    background: darkMode ? '#181a2a' : '#fff',
                                                                    color: theme.text,
                                                                    transition: 'all 0.3s ease',
                                                                    fontFamily: 'Tajawal, Arial, sans-serif'
                                                                },
                                                                required: true
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 411,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 406,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 20
                                                                },
                                                                children: "👥"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 435,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontWeight: 700,
                                                                    color: theme.accent,
                                                                    fontSize: 16
                                                                },
                                                                children: "صفة المستخدم في الدعوى:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 436,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 434,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            marginBottom: 16,
                                                            border: `1px solid ${theme.input}`,
                                                            fontSize: 14,
                                                            lineHeight: 1.6,
                                                            color: theme.text
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 700,
                                                                    color: theme.accent2,
                                                                    marginBottom: 8
                                                                },
                                                                children: "📋 ملاحظة:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 449,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginBottom: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                        children: "المشتكي:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 450,
                                                                        columnNumber: 54
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: '#dc2626',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "جزائية (جنائية)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 450,
                                                                        columnNumber: 80
                                                                    }, this),
                                                                    " - صاحب الشكوى ضد شخص ارتكب جريمة"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 450,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginBottom: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                        children: "المشتكى عليه:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 451,
                                                                        columnNumber: 54
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: '#dc2626',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "جزائية (جنائية)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 451,
                                                                        columnNumber: 85
                                                                    }, this),
                                                                    " - الشخص المتهم بارتكاب الجريمة في مرحلة التحقيق"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 451,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginBottom: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                        children: "المدعي:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 452,
                                                                        columnNumber: 54
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: '#059669',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "مدنية"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 452,
                                                                        columnNumber: 79
                                                                    }, this),
                                                                    " - من يرفع دعوى للمطالبة بحق مادي أو معنوي"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 452,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    marginBottom: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                                                        children: "المدعى عليه:"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 453,
                                                                        columnNumber: 54
                                                                    }, this),
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: '#059669',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "مدنية"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 453,
                                                                        columnNumber: 84
                                                                    }, this),
                                                                    " - الطرف المخاصم الذي تُرفع عليه الدعوى"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 453,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 13,
                                                                    opacity: 0.8,
                                                                    fontStyle: 'italic',
                                                                    marginTop: 12,
                                                                    paddingTop: 12,
                                                                    borderTop: `1px solid ${theme.border}`
                                                                },
                                                                children: "اختر صفتك ليتخصص التحليل والعريضة وفق مصلحتك في الدعوى"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 454,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 439,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8,
                                                            flexWrap: 'wrap',
                                                            marginBottom: 16
                                                        },
                                                        children: [
                                                            'المشتكي',
                                                            'المشتكى عليه',
                                                            'المدعي',
                                                            'المدعى عليه'
                                                        ].map((role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>setPartyRole(role === partyRole ? '' : role),
                                                                style: {
                                                                    background: role === partyRole ? theme.accent : 'transparent',
                                                                    color: role === partyRole ? '#fff' : theme.text,
                                                                    border: `2px solid ${theme.input}`,
                                                                    borderRadius: 10,
                                                                    padding: '8px 12px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 700
                                                                },
                                                                children: role
                                                            }, role, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 459,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 12
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 20
                                                                },
                                                                children: "📄"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 475,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontWeight: 700,
                                                                    color: theme.accent,
                                                                    fontSize: 16
                                                                },
                                                                children: "تفاصيل القضية:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 476,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 474,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                        value: mainText,
                                                        onChange: (e)=>setMainText(e.target.value),
                                                        rows: 6,
                                                        style: {
                                                            width: '100%',
                                                            borderRadius: 12,
                                                            border: `2px solid ${theme.input}`,
                                                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 12 : 16,
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                            marginBottom: 0,
                                                            resize: 'vertical',
                                                            outline: 'none',
                                                            boxShadow: `0 2px 8px ${theme.shadow}`,
                                                            background: darkMode ? '#181a2a' : '#fff',
                                                            color: theme.text,
                                                            transition: 'all 0.3s ease',
                                                            fontFamily: 'Tajawal, Arial, sans-serif',
                                                            lineHeight: 1.6
                                                        },
                                                        placeholder: "أدخل تفاصيل القضية هنا...",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 479,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 397,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
                                                    borderRadius: 16,
                                                    padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 20 : 28,
                                                    textAlign: 'center',
                                                    boxShadow: `0 4px 20px ${theme.accent}33`,
                                                    border: `1px solid ${theme.accent}`
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 20 : 24,
                                                            fontWeight: 800,
                                                            color: '#fff',
                                                            marginBottom: 12
                                                        },
                                                        children: "🚀 جاهز للبدء؟"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 513,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                                            color: 'rgba(255,255,255,0.9)',
                                                            marginBottom: 20,
                                                            lineHeight: 1.6
                                                        },
                                                        children: 'بعد إدخال البيانات، انتقل إلى تبويب "مراحل التحليل" لبدء العملية'
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 516,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('stages'),
                                                        style: {
                                                            background: 'rgba(255,255,255,0.2)',
                                                            color: '#fff',
                                                            border: '2px solid rgba(255,255,255,0.3)',
                                                            borderRadius: 12,
                                                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '12px 24px' : '16px 32px',
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            backdropFilter: 'blur(10px)'
                                                        },
                                                        children: "⚖️ الانتقال لمراحل التحليل"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 519,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 505,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true),
                                    activeTab === 'stages' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                        children: ALL_STAGES.map((stage, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: theme.card,
                                                    borderRadius: 16,
                                                    boxShadow: `0 4px 20px ${theme.shadow}`,
                                                    padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 24,
                                                    marginBottom: 24,
                                                    border: `1.5px solid ${theme.border}`,
                                                    transition: 'all 0.3s ease'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 800,
                                                            color: theme.accent,
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                            marginBottom: 16,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 20 : 24
                                                                },
                                                                children: "⚖️"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 563,
                                                                columnNumber: 25
                                                            }, this),
                                                            stage
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 23
                                                    }, this),
                                                    idx > 0 && stageResults[idx - 1] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 12,
                                                            boxShadow: `0 2px 8px ${theme.shadow}`,
                                                            padding: 16,
                                                            marginBottom: 16,
                                                            border: `1px solid ${theme.input}`,
                                                            color: theme.text,
                                                            fontSize: 15,
                                                            opacity: 0.95
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 700,
                                                                    color: theme.accent2,
                                                                    marginBottom: 8
                                                                },
                                                                children: "📋 ملخص المرحلة السابقة:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 580,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    whiteSpace: 'pre-line',
                                                                    marginTop: 4,
                                                                    lineHeight: 1.6
                                                                },
                                                                children: stageResults[idx - 1]
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 581,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 569,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        disabled: stageLoading[idx],
                                                        onClick: ()=>handleAnalyzeStage(idx),
                                                        style: {
                                                            width: '100%',
                                                            background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 12,
                                                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '14px 0' : '18px 0',
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                            fontWeight: 800,
                                                            cursor: stageLoading[idx] ? 'not-allowed' : 'pointer',
                                                            marginTop: 8,
                                                            boxShadow: `0 4px 16px ${theme.accent}33`,
                                                            letterSpacing: 1,
                                                            transition: 'all 0.3s ease',
                                                            position: 'relative',
                                                            transform: stageLoading[idx] ? 'scale(0.98)' : 'scale(1)'
                                                        },
                                                        children: stageLoading[idx] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                    className: "spinner",
                                                                    style: {
                                                                        display: 'inline-block',
                                                                        width: 20,
                                                                        height: 20,
                                                                        border: '3px solid #fff',
                                                                        borderTop: `3px solid ${theme.accent2}`,
                                                                        borderRadius: '50%',
                                                                        animation: 'spin 1s linear infinite',
                                                                        verticalAlign: 'middle'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/index.tsx",
                                                                    lineNumber: 610,
                                                                    columnNumber: 29
                                                                }, this),
                                                                idx === ALL_STAGES.length - 1 ? '⏳ جاري توليد العريضة النهائية...' : '⏳ جاري التحليل...'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/pages/index.tsx",
                                                            lineNumber: 609,
                                                            columnNumber: 27
                                                        }, this) : idx === ALL_STAGES.length - 1 ? '📜 توليد العريضة القانونية النهائية' : `📜 تحليل ${stage}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 23
                                                    }, this),
                                                    stageErrors[idx] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            color: theme.errorText,
                                                            background: theme.errorBg,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            marginTop: 16,
                                                            textAlign: 'center',
                                                            fontWeight: 700,
                                                            fontSize: 15,
                                                            boxShadow: `0 2px 8px ${theme.errorText}22`,
                                                            border: `1px solid ${theme.errorText}33`
                                                        },
                                                        children: [
                                                            "❌ ",
                                                            stageErrors[idx]
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 619,
                                                        columnNumber: 25
                                                    }, this),
                                                    stageResults[idx] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 16,
                                                            boxShadow: `0 4px 20px ${theme.shadow}`,
                                                            padding: 20,
                                                            marginTop: 20,
                                                            border: `1.5px solid ${theme.input}`,
                                                            color: theme.text,
                                                            opacity: stageShowResult[idx] ? 1 : 0,
                                                            transform: stageShowResult[idx] ? 'translateY(0)' : 'translateY(30px)',
                                                            transition: 'all 0.7s ease'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                                style: {
                                                                    color: theme.accent,
                                                                    marginBottom: 12,
                                                                    fontSize: 18,
                                                                    fontWeight: 800,
                                                                    letterSpacing: 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 8
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                        children: "🔍"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 649,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    "نتيجة التحليل"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 648,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    whiteSpace: 'pre-line',
                                                                    fontSize: 16,
                                                                    lineHeight: 1.8
                                                                },
                                                                children: stageResults[idx]
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 652,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 636,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, stage, true, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 545,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false),
                                    activeTab === 'results' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: theme.card,
                                            borderRadius: 16,
                                            boxShadow: `0 4px 20px ${theme.shadow}`,
                                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 20 : 32,
                                            border: `1.5px solid ${theme.border}`
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 24 : 32,
                                                    fontWeight: 900,
                                                    color: theme.accent,
                                                    marginBottom: 16
                                                },
                                                children: "📊 ملخص النتائج"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 669,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '1fr' : 'repeat(3, 1fr)',
                                                    gap: 16,
                                                    marginBottom: 24
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            border: `1px solid ${theme.border}`,
                                                            textAlign: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 24,
                                                                    fontWeight: 800,
                                                                    color: theme.accent
                                                                },
                                                                children: stageResults.filter((r)=>!!r).length
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 687,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 14,
                                                                    color: theme.text
                                                                },
                                                                children: "مرحلة مكتملة"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 690,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 680,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            border: `1px solid ${theme.border}`,
                                                            textAlign: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 24,
                                                                    fontWeight: 800,
                                                                    color: theme.accent2
                                                                },
                                                                children: ALL_STAGES.length - stageResults.filter((r)=>!!r).length
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 699,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 14,
                                                                    color: theme.text
                                                                },
                                                                children: "مرحلة متبقية"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 702,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 692,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: theme.resultBg,
                                                            borderRadius: 12,
                                                            padding: 16,
                                                            border: `1px solid ${theme.border}`,
                                                            textAlign: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 24,
                                                                    fontWeight: 800,
                                                                    color: theme.accent
                                                                },
                                                                children: [
                                                                    Math.round(stageResults.filter((r)=>!!r).length / ALL_STAGES.length * 100),
                                                                    "%"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 711,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: 14,
                                                                    color: theme.text
                                                                },
                                                                children: "نسبة الإنجاز"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 714,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 704,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 674,
                                                columnNumber: 19
                                            }, this),
                                            stageResults.some((r)=>!!r) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 16 : 18,
                                                            color: theme.text,
                                                            marginBottom: 24,
                                                            lineHeight: 1.6,
                                                            textAlign: 'center'
                                                        },
                                                        children: "نتائج المراحل المكتملة"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 721,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'grid',
                                                            gridTemplateColumns: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '1fr' : 'repeat(2, 1fr)',
                                                            gap: 16
                                                        },
                                                        children: stageResults.map((result, idx)=>result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    background: theme.resultBg,
                                                                    borderRadius: 12,
                                                                    padding: 16,
                                                                    border: `1px solid ${theme.border}`,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease'
                                                                },
                                                                onClick: ()=>setActiveTab('stages'),
                                                                title: "انقر للانتقال إلى مراحل التحليل",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontWeight: 700,
                                                                            color: theme.accent2,
                                                                            marginBottom: 8,
                                                                            fontSize: 14
                                                                        },
                                                                        children: ALL_STAGES[idx]
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 741,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: 13,
                                                                            color: theme.text,
                                                                            lineHeight: 1.5
                                                                        },
                                                                        children: [
                                                                            result.substring(0, 120),
                                                                            "..."
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 744,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: 11,
                                                                            color: theme.accent,
                                                                            marginTop: 8,
                                                                            textAlign: 'center',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: "انقر لعرض النتيجة كاملة"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/index.tsx",
                                                                        lineNumber: 747,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, idx, true, {
                                                                fileName: "[project]/pages/index.tsx",
                                                                lineNumber: 730,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 724,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: theme.resultBg,
                                                    borderRadius: 12,
                                                    padding: 32,
                                                    border: `1px solid ${theme.border}`,
                                                    textAlign: 'center',
                                                    color: theme.text
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 48,
                                                            marginBottom: 16
                                                        },
                                                        children: "📝"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 769,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 18,
                                                            fontWeight: 700,
                                                            marginBottom: 12
                                                        },
                                                        children: "لا توجد نتائج بعد"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 770,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: 14,
                                                            opacity: 0.8,
                                                            marginBottom: 20
                                                        },
                                                        children: 'ابدأ بتحليل المراحل في تبويب "مراحل التحليل" لرؤية النتائج هنا'
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 771,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('stages'),
                                                        style: {
                                                            background: theme.accent,
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 8,
                                                            padding: '12px 24px',
                                                            fontSize: 16,
                                                            fontWeight: 700,
                                                            cursor: 'pointer'
                                                        },
                                                        children: "الانتقال لمراحل التحليل"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/index.tsx",
                                                        lineNumber: 774,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/index.tsx",
                                                lineNumber: 761,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 662,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("footer", {
                        style: {
                            textAlign: 'center',
                            color: '#888',
                            marginTop: 48,
                            fontSize: 15,
                            background: theme.card,
                            borderRadius: 16,
                            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 20 : 32,
                            boxShadow: `0 4px 20px ${theme.shadow}`,
                            border: `1px solid ${theme.border}`,
                            margin: '48px auto 0',
                            maxWidth: 800,
                            width: '90%'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: theme.accent,
                                    marginBottom: 16
                                },
                                children: [
                                    "© ",
                                    new Date().getFullYear(),
                                    " منصة التحليل القانوني الذكي"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 814,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 18,
                                    background: darkMode ? '#2a1a1a' : '#fffbe6',
                                    color: darkMode ? '#ffb6b6' : '#b7791f',
                                    borderRadius: 12,
                                    padding: '16px 20px',
                                    display: 'inline-block',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    boxShadow: `0 2px 8px ${darkMode ? '#ff6b6b22' : '#b7791f22'}`,
                                    border: `1px solid ${darkMode ? '#ff6b6b33' : '#b7791f33'}`,
                                    maxWidth: '90%',
                                    lineHeight: 1.6
                                },
                                children: [
                                    "⚠️ جميع بياناتك (القضايا والمفاتيح) تحفظ محليًا على جهازك فقط ولا يتم رفعها إلى أي خادم.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$db$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["clearAllCases"])();
                                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["set"])('legal_dark_mode', '0');
                                            window.location.reload();
                                        },
                                        style: {
                                            marginRight: 12,
                                            background: '#ff6b6b',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 8,
                                            padding: '8px 18px',
                                            fontWeight: 800,
                                            fontSize: 14,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px #ff6b6b22',
                                            marginLeft: 8,
                                            transition: 'all 0.3s ease'
                                        },
                                        children: "🗑️ مسح كل البيانات"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/index.tsx",
                                        lineNumber: 832,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/index.tsx",
                                lineNumber: 817,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/index.tsx",
                        lineNumber: 800,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 275,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("style", {
                children: `
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `
            }, void 0, false, {
                fileName: "[project]/pages/index.tsx",
                lineNumber: 858,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}}),

};

//# sourceMappingURL=_b88b1ccb._.js.map