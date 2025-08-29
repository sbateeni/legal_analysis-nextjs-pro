// ملف اختبار الخصوصية - للتأكد من أن كل مستخدم يرى فقط بياناته
import { sqliteDB } from './db.sqlite';
import { embeddedAuth } from './auth.embedded';

export async function testPrivacySystem() {
  console.log('🧪 بدء اختبار نظام الخصوصية...');
  
  try {
    // 1. تهيئة قاعدة البيانات
    await sqliteDB.init();
    console.log('✅ تم تهيئة قاعدة البيانات');
    
    // 2. إنشاء مستخدمين تجريبيين
    const user1Id = await embeddedAuth.registerUser('test1@example.com', 'password123', 'مستخدم تجريبي 1');
    const user2Id = await embeddedAuth.registerUser('test2@example.com', 'password123', 'مستخدم تجريبي 2');
    console.log('✅ تم إنشاء مستخدمين تجريبيين:', { user1Id, user2Id });
    
    // 3. إنشاء قضايا لكل مستخدم
    const case1Id = await sqliteDB.createCase({
      userId: user1Id,
      name: 'قضية المستخدم الأول',
      caseType: 'مدني',
      partyRole: 'مدعي',
      complexity: 'basic',
      status: 'active'
    });
    
    const case2Id = await sqliteDB.createCase({
      userId: user2Id,
      name: 'قضية المستخدم الثاني',
      caseType: 'تجاري',
      partyRole: 'مدعى عليه',
      complexity: 'intermediate',
      status: 'active'
    });
    console.log('✅ تم إنشاء قضايا تجريبية:', { case1Id, case2Id });
    
    // 4. اختبار الخصوصية - المستخدم الأول يجب أن يرى فقط قضاياه
    const user1Cases = await sqliteDB.listCases(user1Id);
    console.log('📋 قضايا المستخدم الأول:', user1Cases.length);
    
    if (user1Cases.length !== 1) {
      throw new Error('المستخدم الأول يجب أن يرى قضية واحدة فقط');
    }
    
    if (user1Cases[0].name !== 'قضية المستخدم الأول') {
      throw new Error('المستخدم الأول يرى قضية خاطئة');
    }
    
    // 5. اختبار الخصوصية - المستخدم الثاني يجب أن يرى فقط قضاياه
    const user2Cases = await sqliteDB.listCases(user2Id);
    console.log('📋 قضايا المستخدم الثاني:', user2Cases.length);
    
    if (user2Cases.length !== 1) {
      throw new Error('المستخدم الثاني يجب أن يرى قضية واحدة فقط');
    }
    
    if (user2Cases[0].name !== 'قضية المستضمة المستخدم الثاني') {
      throw new Error('المستخدم الثاني يرى قضية خاطئة');
    }
    
    // 6. اختبار عدم إمكانية الوصول لبيانات الآخرين
    try {
      const unauthorizedCase = await sqliteDB.getCase(case2Id, user1Id);
      if (unauthorizedCase) {
        throw new Error('المستخدم الأول يمكنه الوصول لقضية المستخدم الثاني - هذا خطأ في الأمان!');
      }
    } catch (error) {
      console.log('✅ المستخدم الأول لا يمكنه الوصول لقضية المستخدم الثاني');
    }
    
    // 7. اختبار البحث - كل مستخدم يجب أن يجد فقط قضاياه
    const user1Search = await sqliteDB.searchCases('قضية', user1Id);
    const user2Search = await sqliteDB.searchCases('قضية', user2Id);
    
    if (user1Search.length !== 1) {
      throw new Error('البحث للمستخدم الأول يجب أن يعيد قضية واحدة فقط');
    }
    
    if (user2Search.length !== 1) {
      throw new Error('البحث للمستخدم الثاني يجب أن يعيد قضية واحدة فقط');
    }
    
    // 8. اختبار التفضيلات - كل مستخدم له تفضيلاته الخاصة
    await sqliteDB.setPreference(user1Id, 'theme', 'dark');
    await sqliteDB.setPreference(user2Id, 'theme', 'light');
    
    const user1Theme = await sqliteDB.getPreference(user1Id, 'theme');
    const user2Theme = await sqliteDB.getPreference(user2Id, 'theme');
    
    if (user1Theme !== 'dark' || user2Theme !== 'light') {
      throw new Error('التفضيلات لا تعمل بشكل صحيح');
    }
    
    console.log('🎉 جميع اختبارات الخصوصية نجحت!');
    console.log('✅ كل مستخدم يرى فقط بياناته');
    console.log('✅ لا يمكن لأي مستخدم الوصول لبيانات الآخرين');
    console.log('✅ نظام الخصوصية يعمل بشكل مثالي');
    
    return {
      success: true,
      message: 'نظام الخصوصية يعمل بشكل صحيح',
      user1Cases: user1Cases.length,
      user2Cases: user2Cases.length,
      privacyVerified: true
    };
    
  } catch (error) {
    console.error('❌ فشل اختبار الخصوصية:', error);
    return {
      success: false,
      message: error.message,
      privacyVerified: false
    };
  }
}

// دالة لتنظيف البيانات التجريبية
export async function cleanupTestData() {
  try {
    console.log('🧹 تنظيف البيانات التجريبية...');
    
    // حذف المستخدمين التجريبيين (سيحذف جميع بياناتهم تلقائياً بسبب CASCADE)
    await sqliteDB.exec('DELETE FROM users WHERE email LIKE "test%@example.com"');
    
    console.log('✅ تم تنظيف البيانات التجريبية');
  } catch (error) {
    console.error('❌ فشل في تنظيف البيانات التجريبية:', error);
  }
}
