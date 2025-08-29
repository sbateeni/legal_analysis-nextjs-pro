import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { embeddedAuth } from '../utils/auth.embedded';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await embeddedAuth.getCurrentUser();
        if (currentUser) {
          router.push('/');
        }
      } catch {
        console.log('No current user');
      }
    };

    checkCurrentUser();

    // عرض رسالة النجاح إذا كانت موجودة في URL
    if (router.query.message) {
      setSuccess(router.query.message as string);
      // مسح الرسالة من URL
      router.replace('/login', undefined, { shallow: true });
    }
  }, [router]);

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    // مسح الرسائل عند الكتابة
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!email || !password) {
        setError('يرجى ملء جميع الحقول');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }

      if (password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
      }

      await embeddedAuth.loginUser(email, password);
      setSuccess('تم تسجيل الدخول بنجاح! 🎉');
      
      // الانتقال للصفحة الرئيسية بعد ثانية
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error: unknown) {
      // رسائل خطأ مفصلة
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تسجيل الدخول';
      
      if (errorMessage.includes('بيانات الدخول غير صحيحة')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من البيانات والمحاولة مرة أخرى');
      } else if (errorMessage.includes('المستخدم غير موجود')) {
        setError('هذا الحساب غير مسجل. يرجى إنشاء حساب جديد أو التحقق من البريد الإلكتروني');
      } else if (errorMessage.includes('كلمة المرور')) {
        setError('كلمة المرور غير صحيحة');
      } else if (errorMessage.includes('البريد الإلكتروني')) {
        setError('البريد الإلكتروني غير صحيح');
      } else {
        setError(errorMessage || 'حدث خطأ في تسجيل الدخول، يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToSignup = () => {
    router.push('/signup');
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول - منصة التحليل القانوني</title>
        <meta name="description" content="تسجيل الدخول إلى منصة التحليل القانوني الذكية" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* القسم الأيسر - معلومات الموقع */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-700">
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">⚖️</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">منصة التحليل القانوني الذكية</h1>
                <p className="text-gray-300 text-lg">أول منصة عربية متخصصة في التحليل القانوني المدعوم بالذكاء الاصطناعي</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🚀</span>
                    مميزات المنصة
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      تحليل قانوني متقدم بـ 16 مرحلة
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      دعم كامل للغة العربية
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      مدقق مرجعي ذكي للاستشهادات
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      تصدير PDF و Word احترافي
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      حفظ وإدارة القضايا
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">💡</span>
                    كيف تعمل المنصة؟
                  </h3>
                  <div className="text-gray-300 space-y-2">
                    <p>1. أدخل تفاصيل قضيتك القانونية</p>
                    <p>2. اختر نوع القضية وصفة الخصم</p>
                    <p>3. اتبع المراحل الـ 16 للتحليل</p>
                    <p>4. احصل على عريضة قانونية جاهزة</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    أنواع القضايا المدعومة
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <span>• مدني عام</span>
                    <span>• أحوال شخصية</span>
                    <span>• تجاري</span>
                    <span>• جنائي</span>
                    <span>• عمل</span>
                    <span>• عقاري</span>
                    <span>• إداري</span>
                    <span>• ميراث</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* القسم الأيمن - نموذج تسجيل الدخول */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-700">
              {/* شعار المنصة */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">مرحباً بك مجدداً</h2>
                <p className="text-gray-300">سجل دخولك للوصول إلى منصة التحليل القانوني</p>
              </div>

              {/* نموذج تسجيل الدخول */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* البريد الإلكتروني */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">✉️</span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل بريدك الإلكتروني"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* كلمة المرور */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">🔒</span>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pr-10 pl-4 py-3 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="أدخل كلمة المرور"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="text-gray-400 text-sm">
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* رسالة النجاح */}
                {success && (
                  <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm flex items-center">
                    <span className="mr-2">✅</span>
                    {success}
                  </div>
                )}

                {/* رسالة الخطأ */}
                {error && (
                  <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center">
                    <span className="mr-2">❌</span>
                    {error}
                  </div>
                )}

                {/* زر تسجيل الدخول */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block animate-spin mr-2 text-sm">⏳</span>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">→</span>
                      تسجيل الدخول
                    </>
                  )}
                </button>
              </form>

              {/* روابط إضافية */}
              <div className="mt-6 text-center space-y-3">
                <div className="text-sm text-gray-400">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={handleGoToSignup}
                    className="text-blue-400 hover:text-blue-300 font-medium border-b border-blue-400 hover:border-blue-300 pb-0.5 transition-colors"
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
                
                <div className="text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-gray-300 hover:text-white border-b border-gray-600 hover:border-gray-300 pb-0.5 transition-colors"
                  >
                    العودة للصفحة الرئيسية
                  </button>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 text-center">مزايا التسجيل</h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-1.5">✓</span>
                      حفظ القضايا والمراحل
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-1.5">✓</span>
                      مزامنة البيانات بين الأجهزة
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-1.5">✓</span>
                      تحليل قانوني متقدم
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-400 mr-1.5">✓</span>
                      دعم كامل للغة العربية
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

