import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { User } from '../types/auth';

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التحقق من وجود المستخدم مسجل الدخول
    const userData = localStorage.getItem('legal_user');
    const token = localStorage.getItem('legal_token') || sessionStorage.getItem('legal_token');

    if (!userData || !token) {
      // إذا لم يكن مسجل الدخول، توجيه لصفحة تسجيل الدخول
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    // مسح بيانات تسجيل الدخول
    localStorage.removeItem('legal_user');
    localStorage.removeItem('legal_token');
    sessionStorage.removeItem('legal_token');
    
    // التوجيه لصفحة تسجيل الدخول
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Tajawal, Arial, sans-serif',
        direction: 'rtl'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${theme.border}`,
            borderTop: `4px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: theme.text }}>جاري التحميل...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null; // سيتم التوجيه لصفحة تسجيل الدخول
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: theme.card,
          borderRadius: 16,
          padding: '24px',
          marginBottom: '24px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: theme.accent,
              margin: 0,
              marginBottom: '8px'
            }}>
              🏢 لوحة التحكم
            </h1>
            <p style={{
              fontSize: '18px',
              color: theme.text,
              margin: 0,
              opacity: 0.8
            }}>
              مرحباً، {user.username} ({user.role === 'admin' ? 'مدير' : 'موظف'})
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button style={{
                background: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                📊 الصفحة الرئيسية
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: theme.card,
            borderRadius: 16,
            padding: '24px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
            <h3 style={{ color: theme.accent, margin: 0, marginBottom: '8px' }}>بياناتي</h3>
            <p style={{ color: theme.text, margin: 0, opacity: 0.8 }}>
              {user.email}
            </p>
          </div>

          <div style={{
            background: theme.card,
            borderRadius: 16,
            padding: '24px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ color: theme.accent, margin: 0, marginBottom: '8px' }}>المكتب</h3>
            <p style={{ color: theme.text, margin: 0, opacity: 0.8 }}>
              معرف المكتب: {user.officeId}
            </p>
          </div>

          <div style={{
            background: theme.card,
            borderRadius: 16,
            padding: '24px',
            boxShadow: `0 4px 20px ${theme.shadow}`,
            border: `1px solid ${theme.border}`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ color: theme.accent, margin: 0, marginBottom: '8px' }}>انضممت في</h3>
            <p style={{ color: theme.text, margin: 0, opacity: 0.8 }}>
              {new Date(user.createdAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: theme.card,
          borderRadius: 16,
          padding: '24px',
          boxShadow: `0 4px 20px ${theme.shadow}`,
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: theme.accent,
            margin: 0,
            marginBottom: '20px'
          }}>
            🚀 إجراءات سريعة
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{
                background: theme.resultBg,
                borderRadius: 12,
                padding: '20px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                <h3 style={{ color: theme.accent2, margin: 0, marginBottom: '4px' }}>
                  قضية جديدة
                </h3>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  ابدأ تحليل قضية قانونية جديدة
                </p>
              </div>
            </Link>

            <Link href="/history" style={{ textDecoration: 'none' }}>
              <div style={{
                background: theme.resultBg,
                borderRadius: 12,
                padding: '20px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
                <h3 style={{ color: theme.accent2, margin: 0, marginBottom: '4px' }}>
                  سجل القضايا
                </h3>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  راجع القضايا السابقة
                </p>
              </div>
            </Link>

            <Link href="/chat" style={{ textDecoration: 'none' }}>
              <div style={{
                background: theme.resultBg,
                borderRadius: 12,
                padding: '20px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <h3 style={{ color: theme.accent2, margin: 0, marginBottom: '4px' }}>
                  المساعد القانوني
                </h3>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  احصل على استشارة قانونية
                </p>
              </div>
            </Link>

            {user.role === 'admin' && (
              <div style={{
                background: theme.resultBg,
                borderRadius: 12,
                padding: '20px',
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                opacity: 0.6
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                <h3 style={{ color: theme.accent2, margin: 0, marginBottom: '4px' }}>
                  إدارة الموظفين
                </h3>
                <p style={{ color: theme.text, margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  قريباً...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 