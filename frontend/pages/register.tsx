import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { RegisterRequest, AuthResponse } from '../types/auth';

export default function Register() {
  const router = useRouter();
  const { theme, darkMode } = useTheme();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    officeName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // التحقق من تطابق كلمتي المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    // التحقق من طول كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setSuccess('تم إنشاء الحساب بنجاح! جاري التوجيه لصفحة تسجيل الدخول...');
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'فشل في إنشاء الحساب');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        maxWidth: '450px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: theme.accent, 
            margin: 0 
          }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ 
            color: theme.text, 
            opacity: 0.8, 
            margin: '8px 0 0 0',
            fontSize: '16px'
          }}>
            انضم لمنصة التحليل القانوني الذكي
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Office Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              اسم المكتب/الشركة *
            </label>
            <input
              type="text"
              name="officeName"
              value={formData.officeName}
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
              placeholder="مثال: مكتب المحاماة أحمد"
            />
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              اسم المستخدم *
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

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
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
              placeholder="أدخل البريد الإلكتروني"
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
              كلمة المرور *
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
              placeholder="6 أحرف على الأقل"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: theme.text
            }}>
              تأكيد كلمة المرور *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
              placeholder="أعد إدخال كلمة المرور"
            />
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
                جاري إنشاء الحساب...
              </span>
            ) : (
              'إنشاء الحساب'
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

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '14px', color: theme.text }}>
              لديك حساب بالفعل؟{' '}
              <Link href="/login" style={{
                color: theme.accent,
                textDecoration: 'none',
                fontWeight: 600
              }}>
                تسجيل الدخول
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