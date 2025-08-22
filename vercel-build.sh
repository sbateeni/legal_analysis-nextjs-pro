#!/bin/bash

# تنظيف البناء السابق
rm -rf .next

# تثبيت التبعيات
npm ci

# بناء التطبيق
npm run build

# التحقق من نجاح البناء
if [ $? -eq 0 ]; then
    echo "✅ تم البناء بنجاح"
    exit 0
else
    echo "❌ فشل في البناء"
    exit 1
fi 