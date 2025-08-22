#!/bin/bash

echo "🚀 بدء عملية البناء مع إصلاح npm ci..."

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

# محاولة استخدام npm ci أولاً
echo "📦 محاولة تثبيت التبعيات باستخدام npm ci..."
if npm ci --production=false; then
    echo "✅ تم التثبيت بنجاح باستخدام npm ci"
else
    echo "⚠️ npm ci فشل، جاري استخدام npm install..."
    npm install
fi

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