import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, addEvent } from '@utils/db';

interface AnalysisStage {
  id: string;
  stageIndex: number;
  stage: string;
  input: string;
  output: string;
  date: string;
}

interface LegalCase {
  id: string;
  name: string;
  createdAt: string;
  stages: AnalysisStage[];
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  caseType?: string;
  clientName?: string;
  courtName?: string;
  nextHearing?: string;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'reminder';
  caseId?: string;
  caseName?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
  selectedDate?: string;
}

export default function AddEventModal({ isOpen, onClose, onEventAdded, selectedDate }: AddEventModalProps) {
  const { theme } = useTheme();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate || '',
    time: '',
    type: 'meeting' as 'hearing' | 'deadline' | 'meeting' | 'reminder',
    caseId: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCases();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [selectedDate]);

  const loadCases = async () => {
    try {
      const allCases = await getAllCases();
      const formattedCases: LegalCase[] = allCases.map((c: any) => ({
        ...c,
        status: c.status || 'active',
        priority: c.priority || 'medium',
        caseType: c.caseType || 'غير محدد',
        clientName: c.clientName || '',
        courtName: c.courtName || '',
        nextHearing: c.nextHearing || '',
        notes: c.notes || '',
      }));
      setCases(formattedCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCase = cases.find(c => c.id === formData.caseId);
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: formData.title,
        date: formData.date,
        time: formData.time || undefined,
        type: formData.type,
        caseId: formData.caseId || undefined,
        caseName: selectedCase?.name,
        description: formData.description || undefined,
        priority: formData.priority,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addEvent(newEvent);
      onEventAdded();
      onClose();
      
      // إعادة تعيين النموذج
      setFormData({
        title: '',
        date: selectedDate || '',
        time: '',
        type: 'meeting',
        caseId: '',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error adding event:', error);
      alert('حدث خطأ أثناء إضافة الموعد');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: theme.card,
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: `0 4px 20px ${theme.shadow}`,
        border: `1px solid ${theme.border}`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            color: theme.text,
            margin: '0',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            ➕ إضافة موعد جديد
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              عنوان الموعد *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
              placeholder="أدخل عنوان الموعد"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              التاريخ *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              الوقت (اختياري)
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              نوع الموعد *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="meeting">👥 اجتماع</option>
              <option value="hearing">⚖️ جلسة</option>
              <option value="deadline">⏰ موعد نهائي</option>
              <option value="reminder">🔔 تذكير</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ربط بقضية (اختياري)
            </label>
            <select
              name="caseId"
              value={formData.caseId}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">اختر قضية (اختياري)</option>
              {cases.map(caseItem => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.name} - {caseItem.caseType}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              الأولوية *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="low">🟢 منخفضة</option>
              <option value="medium">🟡 متوسطة</option>
              <option value="high">🔴 عالية</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              الوصف (اختياري)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: theme.card,
                color: theme.text,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="أدخل وصف للموعد"
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: theme.text,
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الموعد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
