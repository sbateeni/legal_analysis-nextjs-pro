import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { embeddedAuth } from '../utils/auth.embedded';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح الرسائل عند الكتابة
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return 'يرجى إدخال الاسم الكامل';
    }

    if (formData.fullName.trim().length < 3) {
      return 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      return 'يرجى إدخال البريد الإلكتروني';
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (formData.password.length < 6) {
      return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'كلمتا المرور غير متطابقتين';
    }

    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      await embeddedAuth.registerUser(
        formData.email,
        formData.password,
        formData.fullName
      );
      
      setSuccess('تم إنشاء الحساب بنجاح! 🎉');
      
      // إعادة تعيين النموذج
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // الانتقال لصفحة تسجيل الدخول بعد ثانيتين
      setTimeout(() => {
        router.push('/login?message=تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول');
      }, 2000);
      
    } catch (error: unknown) {
      // رسائل خطأ مفصلة
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إنشاء الحساب';
      
      if (errorMessage.includes('المستخدم موجود بالفعل')) {
        setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول أو استخدام بريد إلكتروني آخر');
      } else if (errorMessage.includes('email')) {
        setError('البريد الإلكتروني غير صحيح');
      } else if (errorMessage.includes('password')) {
        setError('كلمة المرور غير صحيحة');
      } else {
        setError(errorMessage || 'حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>إنشاء حساب جديد - منصة التحليل القانوني</title>
        <meta name="description" content="إنشاء حساب جديد في منصة التحليل القانوني الذكية" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm">⚖️</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">إنشاء حساب جديد</h1>
            <p className="text-xs text-gray-300">انضم إلى منصة التحليل القانوني الذكية</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-300 mb-1">
                الاسم الكامل
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="أدخل اسمك الكامل"
                  dir="rtl"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">👤</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="ltr"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">✉️</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">🔒</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pr-7 pl-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-2 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-gray-400 text-xs">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">يجب أن تكون 6 أحرف على الأقل</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">🔒</span>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pr-7 pl-3 py-2 text-xs bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="أعد إدخال كلمة المرور"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-2 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="text-gray-400 text-xs">
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-900/50 border border-green-500 text-green-200 px-3 py-2 rounded text-xs flex items-center">
                <span className="mr-2">✅</span>
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded text-xs flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-1 text-xs">⏳</span>
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  <span className="ml-1">→</span>
                  إنشاء حساب
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center space-y-2">
            <div className="text-xs text-gray-400">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={handleGoToLogin}
                className="text-blue-400 hover:text-blue-300 font-medium border-b border-blue-400 hover:border-blue-300 pb-0.5"
              >
                تسجيل الدخول
              </button>
            </div>
            
            <div className="text-xs text-gray-400">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-gray-300 hover:text-white border-b border-gray-600 hover:border-gray-300 pb-0.5"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-xs font-medium text-white mb-3 text-center">مزايا التسجيل</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-center">
                <span className="text-blue-400 ml-1.5 text-xs">✓</span>
                حساب مجاني مع 3 قضايا
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 ml-1.5 text-xs">✓</span>
                حفظ جميع المراحل والتحليلات
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 ml-1.5 text-xs">✓</span>
                دعم كامل للغة العربية
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 ml-1.5 text-xs">✓</span>
                واجهة سهلة الاستخدام
              </li>
              <li className="flex items-center">
                <span className="text-blue-400 ml-1.5 text-xs">✓</span>
                أمان وخصوصية عالية
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
