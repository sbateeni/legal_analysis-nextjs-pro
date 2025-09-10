import React, { useState } from 'react';
import CaseOrganizer from '../components/CaseOrganizer';

const TestCaseOrganizer = () => {
  const [mainText, setMainText] = useState('');
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const sampleCase = `قضية ميراث - توفي والدي وترك لنا منزلاً وقطعة أرض ومبلغ من المال. أخي الأكبر يقول إنه يجب أن يأخذ النصيب الأكبر لأنه الأكبر سناً. أمي تقول إنها تريد أن توزع الميراث بالتساوي بيننا جميعاً. لدي أخ وأختان. المنزل في رام الله والأرض في بيت لحم. المبلغ حوالي 50000 شيكل. والدي لم يترك وصية مكتوبة.`;

  const handleOrganizeCase = () => {
    if (!mainText.trim()) {
      alert('يرجى إدخال تفاصيل القضية أولاً');
      return;
    }
    setShowOrganizer(true);
  };

  const handleCaseOrganized = (organizedText: string) => {
    setMainText(organizedText);
    setShowOrganizer(false);
  };

  const handleCancelOrganizer = () => {
    setShowOrganizer(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          🧪 اختبار منظم القضايا القانونية
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
          }}>
            🔑 مفتاح Gemini API:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="أدخل مفتاح API هنا..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333'
          }}>
            📄 تفاصيل القضية:
          </label>
          <textarea
            value={mainText}
            onChange={(e) => setMainText(e.target.value)}
            rows={8}
            placeholder="أدخل تفاصيل القضية هنا..."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Tajawal, Arial, sans-serif',
              lineHeight: '1.6'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMainText(sampleCase)}
            style={{
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            📝 استخدام مثال تجريبي
          </button>
          <button
            onClick={() => setMainText('')}
            style={{
              background: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#d32f2f'
            }}
          >
            🗑️ مسح النص
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleOrganizeCase}
            disabled={!mainText.trim() || !apiKey.trim()}
            style={{
              background: mainText.trim() && apiKey.trim() 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: mainText.trim() && apiKey.trim() ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            🔧 تنظيم القضية
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '10px' }}>
            💡 ملاحظات:
          </h3>
          <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
            <li>تأكد من إدخال مفتاح Gemini API الصحيح</li>
            <li>يمكنك استخدام المثال التجريبي للاختبار</li>
            <li>المنظم سيقوم بترتيب وتنظيم النص مع الحفاظ على جميع المعلومات</li>
            <li>سيتم استخدام المصطلحات القانونية الصحيحة</li>
          </ul>
        </div>
      </div>

      <CaseOrganizer
        originalText={mainText}
        onOrganized={handleCaseOrganized}
        onCancel={handleCancelOrganizer}
        isVisible={showOrganizer}
        apiKey={apiKey}
      />
    </div>
  );
};

export default TestCaseOrganizer;
