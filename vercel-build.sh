#!/bin/bash

echo "🚀 بدء عملية البناء على Vercel..."

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت Node.js و npm"
    exit 1
fi

echo "✅ npm موجود: $(npm --version)"
echo "✅ Node.js موجود: $(node --version)"

# تنظيف البناء السابق
echo "🧹 تنظيف البناء السابق..."
rm -rf .next
rm -rf node_modules

# تثبيت التبعيات
echo "📦 تثبيت التبعيات..."
npm ci --production=false

# التحقق من وجود ملفات مهمة
echo "🔍 التحقق من الملفات المهمة..."
if [ ! -f "pages/index.tsx" ]; then
    echo "❌ ملف pages/index.tsx غير موجود"
    exit 1
fi

if [ ! -f "pages/_app.tsx" ]; then
    echo "❌ ملف pages/_app.tsx غير موجود"
    exit 1
fi

if [ ! -f "next.config.js" ]; then
    echo "❌ ملف next.config.js غير موجود"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ ملف vercel.json غير موجود"
    exit 1
fi

# بناء التطبيق
echo "🔨 بناء التطبيق..."
npm run build

# التحقق من نجاح البناء
if [ $? -eq 0 ]; then
    echo "✅ تم البناء بنجاح"
    
    # التحقق من وجود مجلد .next
    if [ -d ".next" ]; then
        echo "✅ مجلد .next موجود"
        ls -la .next/
    else
        echo "❌ مجلد .next غير موجود"
        exit 1
    fi
    
    exit 0
else
    echo "❌ فشل في البناء"
    exit 1
fi 