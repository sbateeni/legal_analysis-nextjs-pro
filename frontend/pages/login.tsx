import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { AuthRequest, AuthResponse } from '../types/auth';

export default function Login() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();
  const [formData, setFormData] = useState<AuthRequest>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // تحميل البيانات المحفوظة عند بدء الصفحة
  useEffect(() => {
    const savedUsername = localStorage.getItem('legal_username');
    const savedRememberMe = localStorage.getItem('legal_rememberMe') === 'true';
    
    if (savedUsername && savedRememberMe) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/login-supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        // حفظ البيانات إذا تم تحديد "تذكرني"
        if (formData.rememberMe) {
          localStorage.setItem('legal_username', formData.username);
          localStorage.setItem('legal_rememberMe', 'true');
          localStorage.setItem('legal_token', data.token);
        } else {
          localStorage.removeItem('legal_username');
          localStorage.removeItem('legal_rememberMe');
          sessionStorage.setItem('legal_token', data.token);
        }

        // حفظ بيانات المستخدم
        localStorage.setItem('legal_user', JSON.stringify(data.user));
        
        setSuccess('تم تسجيل الدخول بنجاح! جاري التوجيه...');
        
        // التوجيه للصفحة الرئيسية أو لوحة التحكم
        setTimeout(() => {
          if (data.user && data.user.role === 'admin') {
            router.push('/dashboard');
          } else if (data.user) {
            router.push('/');
          }
        }, 1500);
      } else {
        setError(data.error || 'فشل في تسجيل الدخول');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      color: theme.text,
      fontFamily: 'Tajawal, Arial, sans-serif',
      direction: 'rtl',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: theme.card,
        borderRadius: 20,
        padding: '40px',
        boxShadow: `0 8px 32px ${theme.shadow}`,
        border: `2px solid ${theme.border}`,
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: theme.accent, 
            margin: 0 
          }}>
            تسجيل الدخول
          </h1>
          <p style={{ 
            color: theme.text, 
            opacity: 0.8, 
            margin: '8px 0 0 0',
            fontSize: '16px'
          }}>
            منصة التحليل القانوني الذكي
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `2px solid ${theme.input}`,
                background: darkMode ? '#1a1a2e' : '#fff',
                color: theme.text,
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: `2px solid ${theme.input}`,
                background: darkMode ? '#1a1a2e' : '#fff',
                color: theme.text,
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              placeholder="أدخل كلمة المرور"
            />
          </div>

          {/* Remember Me */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '24px',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              style={{
                width: '18px',
                height: '18px',
                accentColor: theme.accent
              }}
            />
            <label style={{
              fontSize: '14px',
              color: theme.text,
              cursor: 'pointer'
            }}>
              تذكر بياناتي
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent2} 100%)`,
              color: '#fff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                جاري تسجيل الدخول...
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          {/* Error/Success Messages */}
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#dcfce7',
              color: '#16a34a',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Register Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', color: theme.text }}>
              ليس لديك حساب؟{' '}
              <Link href="/register" style={{
                color: theme.accent,
                textDecoration: 'none',
                fontWeight: 600
              }}>
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </form>
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