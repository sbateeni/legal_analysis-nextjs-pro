import React, { useState, useEffect } from 'react';
import { referenceChecker, type LegalReference } from '@utils/referenceChecker';

export default function ReferenceManager() {
  const [references, setReferences] = useState<LegalReference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReference, setEditingReference] = useState<LegalReference | null>(null);

  // نموذج إضافة/تعديل مرجع
  const [formData, setFormData] = useState({
    title: '',
    source: '',
    type: 'law' as 'law' | 'court_decision' | 'legal_opinion' | 'doctrine' | 'international_treaty',
    year: '',
    article: '',
    paragraph: '',
    court: '',
    judge: '',
    validity: 'valid' as 'valid' | 'expired' | 'amended' | 'repealed' | 'unknown',
    notes: '',
    url: ''
  });

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = () => {
    const allReferences = referenceChecker.exportReferences();
    setReferences(allReferences);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadReferences();
      return;
    }

    try {
      const results = await referenceChecker.searchReferences(searchQuery, {
        type: filterType || undefined,
        year: filterYear ? parseInt(filterYear) : undefined
      });
      setReferences(results);
    } catch (error) {
      console.error('خطأ في البحث:', error);
    }
  };

  const handleAddReference = async () => {
    try {
      const year = formData.year ? parseInt(formData.year) : undefined;
      await referenceChecker.addReference({
        title: formData.title,
        source: formData.source,
        type: formData.type,
        year,
        article: formData.article || undefined,
        paragraph: formData.paragraph || undefined,
        court: formData.court || undefined,
        judge: formData.judge || undefined,
        validity: formData.validity,
        notes: formData.notes || undefined,
        url: formData.url || undefined
      });

      resetForm();
      setShowAddForm(false);
      loadReferences();
    } catch (error) {
      console.error('خطأ في إضافة المرجع:', error);
    }
  };

  const handleUpdateReference = async () => {
    if (!editingReference) return;

    try {
      const year = formData.year ? parseInt(formData.year) : undefined;
      await referenceChecker.updateReference(editingReference.id, {
        title: formData.title,
        source: formData.source,
        type: formData.type,
        year,
        article: formData.article || undefined,
        paragraph: formData.paragraph || undefined,
        court: formData.court || undefined,
        judge: formData.judge || undefined,
        validity: formData.validity,
        notes: formData.notes || undefined,
        url: formData.url || undefined
      });

      resetForm();
      setEditingReference(null);
      loadReferences();
    } catch (error) {
      console.error('خطأ في تحديث المرجع:', error);
    }
  };

  const handleDeleteReference = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المرجع؟')) return;

    try {
      await referenceChecker.deleteReference(id);
      loadReferences();
    } catch (error) {
      console.error('خطأ في حذف المرجع:', error);
    }
  };

  const handleEditReference = (reference: LegalReference) => {
    setEditingReference(reference);
    setFormData({
      title: reference.title,
      source: reference.source,
      type: reference.type,
      year: reference.year?.toString() || '',
      article: reference.article || '',
      paragraph: reference.paragraph || '',
      court: reference.court || '',
      judge: reference.judge || '',
      validity: reference.validity,
      notes: reference.notes || '',
      url: reference.url || ''
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      source: '',
      type: 'law',
      year: '',
      article: '',
      paragraph: '',
      court: '',
      judge: '',
      validity: 'valid',
      notes: '',
      url: ''
    });
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'law': return 'قانون';
      case 'court_decision': return 'حكم قضائي';
      case 'legal_opinion': return 'رأي قانوني';
      case 'doctrine': return 'فقه قانوني';
      case 'international_treaty': return 'معاهدة دولية';
      default: return 'مرجع';
    }
  };

  const getValidityColor = (validity: string) => {
    switch (validity) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'amended': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'repealed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidityText = (validity: string) => {
    switch (validity) {
      case 'valid': return 'صالح';
      case 'amended': return 'معدل';
      case 'expired': return 'منتهي الصلاحية';
      case 'repealed': return 'ملغي';
      default: return 'غير معروف';
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المراجع القانونية</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingReference(null);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة مرجع جديد
        </button>
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="البحث في المراجع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">جميع الأنواع</option>
            <option value="law">قانون</option>
            <option value="court_decision">حكم قضائي</option>
            <option value="legal_opinion">رأي قانوني</option>
            <option value="doctrine">فقه قانوني</option>
            <option value="international_treaty">معاهدة دولية</option>
          </select>
          
          <input
            type="number"
            placeholder="السنة..."
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            onClick={handleSearch}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            بحث
          </button>
        </div>
      </div>

      {/* نموذج إضافة/تعديل مرجع */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingReference ? 'تعديل المرجع' : 'إضافة مرجع جديد'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المصدر *</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع *</label>
              <select
                value={formData.type}
                                 onChange={(e) => setFormData({...formData, type: e.target.value as 'law' | 'court_decision' | 'legal_opinion' | 'doctrine' | 'international_treaty'})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="law">قانون</option>
                <option value="court_decision">حكم قضائي</option>
                <option value="legal_opinion">رأي قانوني</option>
                <option value="doctrine">فقه قانوني</option>
                <option value="international_treaty">معاهدة دولية</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
              <input
                type="text"
                value={formData.article}
                onChange={(e) => setFormData({...formData, article: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفقرة</label>
              <input
                type="text"
                value={formData.paragraph}
                onChange={(e) => setFormData({...formData, paragraph: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المحكمة</label>
              <input
                type="text"
                value={formData.court}
                onChange={(e) => setFormData({...formData, court: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القاضي</label>
              <input
                type="text"
                value={formData.judge}
                onChange={(e) => setFormData({...formData, judge: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة *</label>
              <select
                value={formData.validity}
                                 onChange={(e) => setFormData({...formData, validity: e.target.value as 'valid' | 'expired' | 'amended' | 'repealed' | 'unknown'})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="valid">صالح</option>
                <option value="amended">معدل</option>
                <option value="expired">منتهي الصلاحية</option>
                <option value="repealed">ملغي</option>
                <option value="unknown">غير معروف</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={editingReference ? handleUpdateReference : handleAddReference}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingReference ? 'تحديث' : 'إضافة'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingReference(null);
                resetForm();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* قائمة المراجع */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            المراجع ({references.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المرجع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السنة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر فحص
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {references.map((reference) => (
                <tr key={reference.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reference.title}</div>
                      <div className="text-sm text-gray-500">{reference.source}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTypeText(reference.type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{reference.year || '-'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getValidityColor(reference.validity)}`}>
                      {getValidityText(reference.validity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(reference.lastChecked).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReference(reference)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteReference(reference.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {references.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">لا توجد مراجع قانونية</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              إضافة أول مرجع
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
