import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { embeddedAuth, User } from '../utils/auth.embedded';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await embeddedAuth.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.log('No current user');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      // إعادة توجيه المستخدمين غير المسجلين لصفحة تسجيل الدخول
      router.push('/login');
    }
  }, [isLoading, currentUser, router]);

  // إظهار شاشة تحميل أثناء التحقق من المستخدم
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  // إظهار شاشة إعادة التوجيه للمستخدمين غير المسجلين
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-xl">🔒</span>
          </div>
          <p className="text-white text-lg mb-2">يجب تسجيل الدخول للوصول لهذه الصفحة</p>
          <p className="text-gray-300 text-sm">جاري إعادة التوجيه...</p>
        </div>
      </div>
    );
  }

  // إظهار المحتوى للمستخدمين المسجلين
  return <>{children}</>;
}
