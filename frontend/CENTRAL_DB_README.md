# 🗄️ قاعدة البيانات المركزية - منصة التحليل القانوني

## 📋 نظرة عامة

تم تطوير نظام قاعدة بيانات مركزي جديد يحل مشكلة عدم المزامنة بين الأجهزة. الآن جميع المستخدمين يستخدمون قاعدة بيانات واحدة مركزية مع ضمان الخصوصية التامة.

## 🏗️ البنية الجديدة

### 1. **قاعدة البيانات المركزية** (`central-db.ts`)
- قاعدة بيانات SQLite مركزية واحدة
- جميع المستخدمين يشاركون نفس القاعدة
- خصوصية مضمونة عبر `userId` لكل عملية

### 2. **API المركزي** (`/api/database.ts`)
- نقطة وصول واحدة لجميع العمليات
- معالجة آمنة للبيانات
- دعم كامل للعمليات CRUD

### 3. **نظام المصادقة المركزي** (`auth.embedded.central.ts`)
- مصادقة موحدة لجميع المستخدمين
- إدارة الجلسات والاشتراكات
- وصول آمن للبيانات

## 🔐 مبدأ الخصوصية

```
المستخدم A (userId: abc123) ←→ قاعدة البيانات المركزية ←→ المستخدم B (userId: def456)
     ↓                                                           ↓
  يرى فقط بياناته (WHERE userId = 'abc123')              يرى فقط بياناته (WHERE userId = 'def456')
```

**مثال:**
- المستخدم A ينشئ قضية → تُحفظ مع `userId: 'abc123'`
- المستخدم B ينشئ قضية → تُحفظ مع `userId: 'def456'`
- كل مستخدم يرى فقط قضاياه الخاصة

## 🚀 المميزات

### ✅ **المزامنة الفورية**
- البيانات تُحدث فوراً على جميع الأجهزة
- لا حاجة لتصدير/استيراد البيانات
- تجربة مستخدم موحدة

### ✅ **الخصوصية المضمونة**
- كل مستخدم معزول تماماً
- لا يمكن لأي مستخدم الوصول لبيانات الآخرين
- فهارس محسنة للأداء والأمان

### ✅ **الأمان المتقدم**
- تشفير كلمات المرور بـ bcrypt
- تحقق من صحة الجلسات
- حماية من SQL Injection

### ✅ **سهولة الصيانة**
- قاعدة بيانات واحدة للصيانة
- نسخ احتياطية مركزية
- تحديثات موحدة

## 📁 الملفات الجديدة

```
frontend/
├── utils/
│   ├── central-db.ts              # قاعدة البيانات المركزية
│   └── auth.embedded.central.ts   # نظام المصادقة المركزي
├── pages/
│   ├── api/
│   │   └── database.ts            # API للوصول للبيانات
│   └── test-central-db.tsx        # صفحة اختبار النظام
└── CENTRAL_DB_README.md           # هذا الملف
```

## 🔧 التثبيت والإعداد

### 1. **تثبيت التبعيات**
```bash
npm install sqlite3 sqlite
```

### 2. **تهيئة قاعدة البيانات**
```typescript
import { centralDB } from './utils/central-db';

// تهيئة قاعدة البيانات المركزية
await centralDB.init();
```

### 3. **استخدام نظام المصادقة**
```typescript
import { centralEmbeddedAuth } from './utils/auth.embedded.central';

// إنشاء مستخدم جديد
const userId = await centralEmbeddedAuth.registerUser(
  'user@example.com',
  'password123',
  'اسم المستخدم'
);

// تسجيل الدخول
const user = await centralEmbeddedAuth.loginUser(
  'user@example.com',
  'password123'
);
```

## 🧪 اختبار النظام

### **صفحة الاختبار: `/test-central-db`**

1. **تشغيل جميع الاختبارات** - اختبار شامل للنظام
2. **اختبار الخصوصية** - التأكد من عزل البيانات
3. **تنظيف البيانات التجريبية** - حذف البيانات التجريبية

### **اختبارات تلقائية:**
- ✅ إنشاء المستخدمين
- ✅ تسجيل الدخول
- ✅ إنشاء القضايا
- ✅ جلب البيانات
- ✅ حفظ التفضيلات
- ✅ إدارة الاشتراكات
- ✅ التحقق من الخصوصية

## 📊 هيكل قاعدة البيانات

### **جدول المستخدمين**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  fullName TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  subscriptionType TEXT DEFAULT 'free',
  lastLogin TEXT,
  isActive BOOLEAN DEFAULT 1
);
```

### **جدول القضايا**
```sql
CREATE TABLE cases (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  caseType TEXT,
  partyRole TEXT,
  complexity TEXT,
  status TEXT DEFAULT 'active',
  tags TEXT,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### **جدول المراحل**
```sql
CREATE TABLE stages (
  id TEXT PRIMARY KEY,
  caseId TEXT NOT NULL,
  userId TEXT NOT NULL,
  stageName TEXT NOT NULL,
  stageIndex INTEGER NOT NULL,
  input TEXT,
  output TEXT,
  createdAt TEXT NOT NULL,
  completedAt TEXT,
  status TEXT DEFAULT 'pending',
  metadata TEXT,
  FOREIGN KEY (caseId) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔄 الهجرة من النظام القديم

### **الخطوات:**
1. **إنشاء قاعدة البيانات المركزية**
2. **تصدير البيانات من النظام القديم**
3. **استيراد البيانات للنظام الجديد**
4. **اختبار النظام**
5. **إزالة النظام القديم**

### **أدوات الهجرة:**
- تصدير البيانات إلى JSON
- استيراد البيانات عبر API
- التحقق من صحة البيانات
- اختبار الخصوصية

## 🚨 ملاحظات مهمة

### **الأمان:**
- قاعدة البيانات محمية بـ `userId` لكل عملية
- لا يمكن لأي مستخدم تجاوز حدود الخصوصية
- جميع العمليات تُسجل للتتبع

### **الأداء:**
- فهارس محسنة للاستعلامات السريعة
- استعلامات محسنة للخصوصية
- تخزين مؤقت للبيانات المتكررة

### **النسخ الاحتياطية:**
- نسخ احتياطية دورية
- استرداد البيانات في حالة الطوارئ
- تتبع التغييرات

## 📞 الدعم والمساعدة

### **في حالة المشاكل:**
1. تحقق من سجلات الخادم
2. اختبر النظام عبر صفحة الاختبار
3. تحقق من اتصال قاعدة البيانات
4. راجع سجلات الأخطاء

### **للمطورين:**
- جميع العمليات مُسجلة في Console
- API يعيد رسائل خطأ واضحة
- اختبارات شاملة متاحة

## 🎯 الخطوات التالية

### **قصيرة المدى:**
- [ ] اختبار النظام الشامل
- [ ] اختبار الخصوصية
- [ ] اختبار الأداء

### **متوسطة المدى:**
- [ ] هجرة البيانات من النظام القديم
- [ ] تدريب المستخدمين
- [ ] مراقبة الأداء

### **طويلة المدى:**
- [ ] تحسينات الأداء
- [ ] ميزات إضافية
- [ ] توسيع النظام

---

**🎉 تهانينا! الآن لديك نظام قاعدة بيانات مركزي متقدم مع خصوصية مضمونة ومزامنة فورية!**
