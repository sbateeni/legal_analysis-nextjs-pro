module.exports = {

"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@vercel/blob [external] (@vercel/blob, esm_import)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
const mod = await __turbopack_context__.y("@vercel/blob");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/bcryptjs [external] (bcryptjs, esm_import)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
const mod = await __turbopack_context__.y("bcryptjs");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/pages/api/auth/register.ts [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s({
    "default": (()=>handler)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/@vercel/blob [external] (@vercel/blob, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/bcryptjs [external] (bcryptjs, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__
]);
([__TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
;
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    try {
        const { username, email, password, confirmPassword, officeName } = req.body;
        // Auto-detect Vercel Blob token (with or without prefix)
        let BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
        if (!BLOB_TOKEN) {
            // Try to find prefixed token (e.g., VERCEL_BLOB_RW_*_READ_WRITE_TOKEN)
            const envKeys = Object.keys(process.env);
            const blobTokenKey = envKeys.find((key)=>key.includes('BLOB') && key.includes('READ_WRITE_TOKEN'));
            if (blobTokenKey) {
                BLOB_TOKEN = process.env[blobTokenKey];
            }
        }
        if (!BLOB_TOKEN) {
            return res.status(500).json({
                success: false,
                error: 'إعداد التخزين مفقود: يرجى ضبط المتغير BLOB_READ_WRITE_TOKEN في البيئة (ملف .env.local) ثم إعادة تشغيل الخادم.'
            });
        }
        // Normalize inputs
        const normalizedUsername = (username || '').trim();
        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedOfficeName = (officeName || '').trim();
        // التحقق من المدخلات
        if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword || !normalizedOfficeName) {
            return res.status(400).json({
                success: false,
                error: 'جميع الحقول مطلوبة'
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'كلمتا المرور غير متطابقتين'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            });
        }
        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                error: 'البريد الإلكتروني غير صحيح'
            });
        }
        try {
            // قراءة المستخدمين الموجودين
            const { blobs } = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__["list"])({
                token: BLOB_TOKEN
            });
            const usersBlobName = 'users.json';
            const officesBlobName = 'offices.json';
            let users = [];
            let offices = [];
            // قراءة المستخدمين
            const usersFile = blobs.find((blob)=>blob.pathname === usersBlobName);
            if (usersFile) {
                const response = await fetch(usersFile.url);
                users = await response.json();
            }
            // قراءة المكاتب
            const officesFile = blobs.find((blob)=>blob.pathname === officesBlobName);
            if (officesFile) {
                const response = await fetch(officesFile.url);
                offices = await response.json();
            }
            // التحقق من عدم تكرار اسم المستخدم (بدون مسافات وبلا تمييز حالة الأحرف)
            if (users.some((u)=>(u.username || '').trim().toLowerCase() === normalizedUsername.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'اسم المستخدم مستخدم بالفعل'
                });
            }
            // التحقق من عدم تكرار البريد الإلكتروني (بدون مسافات وبلا تمييز حالة الأحرف)
            if (users.some((u)=>(u.email || '').trim().toLowerCase() === normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    error: 'البريد الإلكتروني مستخدم بالفعل'
                });
            }
            // التحقق من عدم تكرار اسم المكتب (بدون مسافات وبلا تمييز حالة الأحرف)
            if (offices.some((o)=>(o.name || '').trim().toLowerCase() === normalizedOfficeName.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'اسم المكتب مستخدم بالفعل'
                });
            }
            // تشفير كلمة المرور
            const saltRounds = 12;
            const hashedPassword = await __TURBOPACK__imported__module__$5b$externals$5d2f$bcryptjs__$5b$external$5d$__$28$bcryptjs$2c$__esm_import$29$__["default"].hash(password, saltRounds);
            // إنشاء معرفات فريدة
            const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const officeId = `office_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // إنشاء المكتب
            const newOffice = {
                id: officeId,
                name: normalizedOfficeName,
                ownerId: userId,
                createdAt: new Date(),
                employeeCount: 1
            };
            // إنشاء المستخدم
            const newUser = {
                id: userId,
                username: normalizedUsername,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'admin',
                officeId,
                createdAt: new Date(),
                isActive: true
            };
            // إضافة المستخدم والمكتب للقوائم
            users.push(newUser);
            offices.push(newOffice);
            // حفظ المستخدمين
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__["put"])(usersBlobName, JSON.stringify(users, null, 2), {
                access: 'public',
                addRandomSuffix: false,
                token: BLOB_TOKEN
            });
            // حفظ المكاتب
            await (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$vercel$2f$blob__$5b$external$5d$__$2840$vercel$2f$blob$2c$__esm_import$29$__["put"])(officesBlobName, JSON.stringify(offices, null, 2), {
                access: 'public',
                addRandomSuffix: false,
                token: BLOB_TOKEN
            });
            // إرسال الاستجابة
            const response = {
                success: true,
                message: 'تم إنشاء الحساب بنجاح'
            };
            return res.status(201).json(response);
        } catch (blobError) {
            console.error('Blob error:', blobError);
            return res.status(500).json({
                success: false,
                error: 'خطأ في قاعدة البيانات'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            error: 'خطأ داخلي في الخادم'
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/node_modules/next/dist/esm/server/route-modules/pages-api/module.compiled.js [api] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if ("TURBOPACK compile-time truthy", 1) {
        if ("TURBOPACK compile-time truthy", 1) {
            module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)");
        } else {
            "TURBOPACK unreachable";
        }
    } else {
        "TURBOPACK unreachable";
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/esm/server/route-kind.js [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "RouteKind": (()=>RouteKind)
});
var RouteKind = /*#__PURE__*/ function(RouteKind) {
    /**
   * `PAGES` represents all the React pages that are under `pages/`.
   */ RouteKind["PAGES"] = "PAGES";
    /**
   * `PAGES_API` represents all the API routes under `pages/api/`.
   */ RouteKind["PAGES_API"] = "PAGES_API";
    /**
   * `APP_PAGE` represents all the React pages that are under `app/` with the
   * filename of `page.{j,t}s{,x}`.
   */ RouteKind["APP_PAGE"] = "APP_PAGE";
    /**
   * `APP_ROUTE` represents all the API routes and metadata routes that are under `app/` with the
   * filename of `route.{j,t}s{,x}`.
   */ RouteKind["APP_ROUTE"] = "APP_ROUTE";
    /**
   * `IMAGE` represents all the images that are generated by `next/image`.
   */ RouteKind["IMAGE"] = "IMAGE";
    return RouteKind;
}({}); //# sourceMappingURL=route-kind.js.map
}}),
"[project]/node_modules/next/dist/esm/build/templates/helpers.js [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * Hoists a name from a module or promised module.
 *
 * @param module the module to hoist the name from
 * @param name the name to hoist
 * @returns the value on the module (or promised module)
 */ __turbopack_context__.s({
    "hoist": (()=>hoist)
});
function hoist(module, name) {
    // If the name is available in the module, return it.
    if (name in module) {
        return module[name];
    }
    // If a property called `then` exists, assume it's a promise and
    // return a promise that resolves to the name.
    if ('then' in module && typeof module.then === 'function') {
        return module.then((mod)=>hoist(mod, name));
    }
    // If we're trying to hoise the default export, and the module is a function,
    // return the module itself.
    if (typeof module === 'function' && name === 'default') {
        return module;
    }
    // Otherwise, return undefined.
    return undefined;
} //# sourceMappingURL=helpers.js.map
}}),
"[project]/node_modules/next/dist/esm/build/templates/pages-api.js { INNER_PAGE => \"[project]/pages/api/auth/register.ts [api] (ecmascript)\" } [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, a: __turbopack_async_module__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__),
    "routeModule": (()=>routeModule)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$pages$2d$api$2f$module$2e$compiled$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/route-modules/pages-api/module.compiled.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/route-kind.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/build/templates/helpers.js [api] (ecmascript)");
// Import the userland code.
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/api/auth/register.ts [api] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
]);
([__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
;
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__["hoist"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, 'default');
const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__["hoist"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, 'config');
const routeModule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$pages$2d$api$2f$module$2e$compiled$2e$js__$5b$api$5d$__$28$ecmascript$29$__["PagesAPIRouteModule"]({
    definition: {
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$api$5d$__$28$ecmascript$29$__["RouteKind"].PAGES_API,
        page: "/api/auth/register",
        pathname: "/api/auth/register",
        // The following aren't used in production.
        bundlePath: '',
        filename: ''
    },
    userland: __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$auth$2f$register$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
}); //# sourceMappingURL=pages-api.js.map
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__a6afc453._.js.map