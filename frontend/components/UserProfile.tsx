import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { embeddedAuth, User, Subscription } from '../utils/auth.embedded';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await embeddedAuth.getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);
        
        // تحميل معلومات الاشتراك
        const userSubscription = await embeddedAuth.checkSubscriptionStatus(currentUser.id);
        setSubscription(userSubscription);
        
        // تعبئة نموذج التعديل
        setEditForm({
          fullName: currentUser.fullName,
          email: currentUser.email
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);



  const handleLogout = async () => {
    try {
      await embeddedAuth.logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await embeddedAuth.updateUserProfile(user.id, editForm);
      
      // تحديث البيانات المحلية
      setUser(prev => prev ? {
        ...prev,
        fullName: editForm.fullName,
        email: editForm.email
      } : null);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user?.fullName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleUpgradeSubscription = async (planType: 'monthly' | 'yearly') => {
    if (!user) return;

    try {
      await embeddedAuth.upgradeSubscription(user.id, planType);
      
      // إعادة تحميل البيانات
      const updatedUser = await embeddedAuth.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
        const userSubscription = await embeddedAuth.checkSubscriptionStatus(updatedUser.id);
        setSubscription(userSubscription);
      }
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'free': return 'text-gray-400';
      case 'monthly': return 'text-blue-400';
      case 'yearly': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'free': return 'bg-gray-700 text-gray-300';
      case 'monthly': return 'bg-blue-700 text-blue-200';
      case 'yearly': return 'bg-green-700 text-green-200';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* شريط العنوان */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            العودة للرئيسية
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* معلومات المستخدم */}
          <div className="lg:col-span-2 space-y-6">
            {/* البطاقة الرئيسية */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-4 space-x-reverse mb-6">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionBadge(user.subscriptionType)}`}>
                      {user.subscriptionType === 'free' ? 'مجاني' : 
                       user.subscriptionType === 'monthly' ? 'شهري' : 'سنوي'}
                    </span>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">تاريخ الإنشاء:</span>
                  <p className="text-white">{user.createdAt.toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <span className="text-gray-400">آخر تسجيل دخول:</span>
                  <p className="text-white">{user.lastLogin ? user.lastLogin.toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {/* تعديل الملف الشخصي */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">تعديل الملف الشخصي</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    تعديل
                  </button>
                ) : (
                  <div className="space-x-2 space-x-reverse">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      dir="ltr"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">الاسم الكامل:</span>
                    <p className="text-white">{user.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">البريد الإلكتروني:</span>
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* زر تسجيل الخروج */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>

          {/* معلومات الاشتراك */}
          <div className="space-y-6">
            {/* حالة الاشتراك */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">حالة الاشتراك</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getSubscriptionColor(user.subscriptionType)}`}>
                    {user.subscriptionType === 'free' ? 'مجاني' : 
                     user.subscriptionType === 'monthly' ? 'شهري' : 'سنوي'}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {user.subscriptionType === 'free' ? '3 قضايا' : 
                     user.subscriptionType === 'monthly' ? 'قضايا غير محدودة' : 'قضايا غير محدودة'}
                  </p>
                </div>

                {subscription && (
                  <div className="text-sm text-gray-400 space-y-2">
                    <div>
                      <span>تاريخ البداية:</span>
                      <p className="text-white">{subscription.startDate.toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <span>تاريخ الانتهاء:</span>
                      <p className="text-white">{subscription.endDate.toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                )}

                {user.subscriptionType === 'free' && (
                  <div className="space-y-3">
                    <div className="text-center text-sm text-gray-400">
                      ترقية إلى خطة مدفوعة
                    </div>
                    <button
                      onClick={() => handleUpgradeSubscription('monthly')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      خطة شهرية - $9.99
                    </button>
                    <button
                      onClick={() => handleUpgradeSubscription('yearly')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                    >
                      خطة سنوية - $99
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">إحصائيات سريعة</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">عدد القضايا:</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">المراحل المكتملة:</span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">آخر نشاط:</span>
                  <span className="text-white font-medium">اليوم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
