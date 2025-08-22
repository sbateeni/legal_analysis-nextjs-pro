module.exports = {

"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

module.exports = mod;
}}),
"[externals]/react/jsx-runtime [external] (react/jsx-runtime, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react/jsx-runtime", () => require("react/jsx-runtime"));

module.exports = mod;
}}),
"[externals]/react [external] (react, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react", () => require("react"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/pages-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/utils/theme.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "darkTheme": (()=>darkTheme),
    "lightTheme": (()=>lightTheme)
});
const lightTheme = {
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f7f7fa 100%)',
    card: '#fff',
    border: '#e0e7ff',
    input: '#c7d2fe',
    text: '#222',
    accent: '#4f46e5',
    accent2: '#6366f1',
    resultBg: 'linear-gradient(135deg, #f5f7ff 0%, #e0e7ff 100%)',
    errorBg: '#fff0f0',
    errorText: '#e53e3e',
    shadow: '#6366f122'
};
const darkTheme = {
    background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)',
    card: '#232946',
    border: '#393e5c',
    input: '#393e5c',
    text: '#f7f7fa',
    accent: '#a3a8f0',
    accent2: '#6366f1',
    resultBg: 'linear-gradient(135deg, #232946 0%, #393e5c 100%)',
    errorBg: '#3a1a1a',
    errorText: '#ff6b6b',
    shadow: '#23294655'
};
}}),
"[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ThemeProvider": (()=>ThemeProvider),
    "useTheme": (()=>useTheme)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb-keyval/dist/index.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$theme$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/theme.ts [ssr] (ecmascript)");
;
;
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["createContext"])(undefined);
function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        let isMounted = true;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["get"])('legal_dark_mode').then((savedTheme)=>{
            if (!isMounted) return;
            if (savedTheme === '1') setDarkMode(true);
            setMounted(true);
        });
        return ()=>{
            isMounted = false;
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!mounted) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2d$keyval$2f$dist$2f$index$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["set"])('legal_dark_mode', darkMode ? '1' : '0');
    }, [
        darkMode,
        mounted
    ]);
    const theme = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>darkMode ? __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$theme$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["darkTheme"] : __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$theme$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["lightTheme"], [
        darkMode
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useMemo"])(()=>({
            darkMode,
            setDarkMode,
            theme,
            mounted
        }), [
        darkMode,
        theme,
        mounted
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/ThemeContext.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
function useTheme() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
}}),
"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[externals]/react-dom [external] (react-dom, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}}),
"[externals]/crypto-js [external] (crypto-js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto-js", () => require("crypto-js"));

module.exports = mod;
}}),
"[project]/utils/crypto.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "decrypt": (()=>decrypt),
    "encrypt": (()=>encrypt),
    "getScreenSize": (()=>getScreenSize),
    "isMobile": (()=>isMobile),
    "isSmallScreen": (()=>isSmallScreen)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto$2d$js__$5b$external$5d$__$28$crypto$2d$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto-js [external] (crypto-js, cjs)");
;
const SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
function encrypt(text) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto$2d$js__$5b$external$5d$__$28$crypto$2d$js$2c$__cjs$29$__["default"].AES.encrypt(text, SECRET).toString();
}
function decrypt(cipher) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto$2d$js__$5b$external$5d$__$28$crypto$2d$js$2c$__cjs$29$__["default"].AES.decrypt(cipher, SECRET).toString(__TURBOPACK__imported__module__$5b$externals$5d2f$crypto$2d$js__$5b$external$5d$__$28$crypto$2d$js$2c$__cjs$29$__["default"].enc.Utf8);
}
function isMobile() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    "TURBOPACK unreachable";
}
function getScreenSize() {
    if ("TURBOPACK compile-time truthy", 1) return 'desktop';
    "TURBOPACK unreachable";
    const width = undefined;
}
function isSmallScreen() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    "TURBOPACK unreachable";
}
}}),
"[project]/components/Header.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Header)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/crypto.ts [ssr] (ecmascript)");
;
;
;
;
;
function Header() {
    const { darkMode, setDarkMode, theme, mounted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    if (!mounted) return null;
    const isActive = (path)=>router.pathname === path;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        style: {
            width: '100%',
            background: `linear-gradient(135deg, ${theme.accent2} 0%, ${theme.accent} 100%)`,
            color: '#fff',
            padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '16px 0 10px 0' : '18px 0 12px 0',
            marginBottom: 0,
            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
            textAlign: 'center',
            letterSpacing: 1,
            fontWeight: 800,
            fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 22 : 26
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 10 : 14
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 26 : 30
                            },
                            children: "⚖️"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            style: {
                                color: '#fff',
                                textDecoration: 'none'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                children: "منصة التحليل القانوني الذكي"
                            }, void 0, false, {
                                fileName: "[project]/components/Header.tsx",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Header.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "header-nav",
                    style: {
                        display: 'flex',
                        flexDirection: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 8 : 18,
                        marginTop: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 8 : 6,
                        flexWrap: 'wrap',
                        maxWidth: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: ()=>setDarkMode(!darkMode),
                            style: {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 22 : 26,
                                color: '#fff',
                                outline: 'none',
                                transition: 'color 0.2s',
                                padding: 0
                            },
                            "aria-label": "تبديل الوضع الليلي",
                            children: darkMode ? '🌙' : '☀️'
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            style: {
                                color: '#fff',
                                background: isActive('/') ? '#22c55e' : '#22c55ecc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "🏠 الرئيسية"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/chat",
                            style: {
                                color: '#fff',
                                background: isActive('/chat') ? '#10b981' : '#10b981cc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "🤖 المساعد"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/analytics",
                            style: {
                                color: '#fff',
                                background: isActive('/analytics') ? '#f59e0b' : '#f59e0bcc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "📊 التحليلات"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 68,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/history",
                            style: {
                                color: '#fff',
                                background: isActive('/history') ? '#6366f1' : '#6366f1cc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "📑 القضايا"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/settings",
                            style: {
                                color: '#fff',
                                background: isActive('/settings') ? '#14b8a6' : '#14b8a6cc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "⚙️ الإعدادات"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/about",
                            style: {
                                color: '#fff',
                                background: isActive('/about') ? '#4f46e5' : '#4f46e5cc',
                                borderRadius: 8,
                                padding: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '8px 16px' : '4px 14px',
                                fontWeight: 700,
                                fontSize: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? 14 : 16,
                                textDecoration: 'none',
                                boxShadow: '0 1px 4px #0002',
                                letterSpacing: 1,
                                transition: 'background 0.2s',
                                width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '100%' : 'auto',
                                minWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '140px' : 'auto',
                                maxWidth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])() ? '200px' : 'none',
                                textAlign: 'center'
                            },
                            children: "؟ تعليمات"
                        }, void 0, false, {
                            fileName: "[project]/components/Header.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/Header.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/Header.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/Header.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/MobileNav.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>MobileNav)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/link.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/crypto.ts [ssr] (ecmascript)");
;
;
;
;
function MobileNav() {
    const { darkMode, setDarkMode, mounted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    if (!mounted || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])()) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("nav", {
        style: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100vw',
            background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 -2px 12px #0002',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '6px 0 4px 0',
            zIndex: 100,
            paddingBottom: 'calc(6px + env(safe-area-inset-bottom))'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "🏠"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "الرئيسية"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/chat",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "🤖"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "المساعد"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/analytics",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "📊"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "التحليلات"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/history",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "📑"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "القضايا"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/settings",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "⚙️"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "الإعدادات"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: "/about",
                style: {
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 20,
                    flex: 1,
                    textDecoration: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: "❓"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "عن"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                onClick: ()=>setDarkMode(!darkMode),
                style: {
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: 20,
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    outline: 'none'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: darkMode ? '🌙' : '☀️'
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 10,
                            marginTop: 2
                        },
                        children: "الوضع"
                    }, void 0, false, {
                        fileName: "[project]/components/MobileNav.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MobileNav.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MobileNav.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
}}),
"[project]/components/Layout.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Layout)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Header.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MobileNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MobileNav.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/crypto.ts [ssr] (ecmascript)");
;
;
;
;
;
function Layout({ children }) {
    const { theme, mounted } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const showHeader = !mounted ? true : !(0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$crypto$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["isMobile"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
            showHeader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Layout.tsx",
                lineNumber: 21,
                columnNumber: 22
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                style: {
                    maxWidth: 1000,
                    width: '100%',
                    margin: '0 auto',
                    padding: '2rem 1rem'
                },
                children: children
            }, void 0, false, {
                fileName: "[project]/components/Layout.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MobileNav$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/Layout.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Layout.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}}),
"[project]/utils/metrics.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "clearStoredWebVitals": (()=>clearStoredWebVitals),
    "getStoredWebVitals": (()=>getStoredWebVitals),
    "recordWebVital": (()=>recordWebVital)
});
const METRICS_STORAGE_KEY = 'legal_metrics_vitals';
const MAX_SAMPLES = 100;
function readStoredMetrics() {
    if ("TURBOPACK compile-time truthy", 1) return [];
    "TURBOPACK unreachable";
}
function writeStoredMetrics(samples) {
    if ("TURBOPACK compile-time truthy", 1) return;
    "TURBOPACK unreachable";
}
function recordWebVital(metric) {
    const samples = readStoredMetrics();
    samples.push({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        label: metric.label,
        startTime: metric.startTime
    });
    writeStoredMetrics(samples);
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            // eslint-disable-next-line no-console
            console.debug('[WebVital]', metric.name, Math.round(metric.value * 100) / 100, metric.id);
        } catch  {}
    }
}
function getStoredWebVitals() {
    return readStoredMetrics();
}
function clearStoredWebVitals() {
    writeStoredMetrics([]);
}
}}),
"[project]/pages/_app.tsx [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>App),
    "reportWebVitals": (()=>reportWebVitals)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/head.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/contexts/ThemeContext.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Layout.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$metrics$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/metrics.ts [ssr] (ecmascript)");
;
;
;
;
;
;
;
;
function reportWebVitals(metric) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$metrics$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["recordWebVital"])(metric);
}
function App({ Component, pageProps }) {
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if ("undefined" !== 'undefined' && 'serviceWorker' in navigator) {
            "TURBOPACK unreachable";
        }
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$head$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("link", {
                    rel: "icon",
                    href: "/favicon.ico"
                }, void 0, false, {
                    fileName: "[project]/pages/_app.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                href: "#main-content",
                className: "skip-link",
                children: "تخطي إلى المحتوى"
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$contexts$2f$ThemeContext$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Layout$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
                        id: "main-content",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Component, {
                            ...pageProps
                        }, void 0, false, {
                            fileName: "[project]/pages/_app.tsx",
                            lineNumber: 34,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/_app.tsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/_app.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/_app.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__de75aff0._.js.map