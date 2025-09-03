import React, { useState, useEffect } from 'react';
import { LegalReference } from '@utils/referenceChecker';

interface ReferenceNotificationProps {
  reference: LegalReference;
  onClose: () => void;
  onViewDetails: () => void;
}

export default function ReferenceNotification({ reference, onClose, onViewDetails }: ReferenceNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // تأخير قصير لإظهار الإشعار
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getValidityColor = (validity: string) => {
    switch (validity) {
      case 'valid': return 'text-green-600';
      case 'amended': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      case 'repealed': return 'text-red-600';
      default: return 'text-gray-600';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'law': return '📜';
      case 'court_decision': return '⚖️';
      case 'legal_opinion': return '💭';
      case 'doctrine': return '📚';
      case 'international_treaty': return '🌍';
      default: return '📄';
    }
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

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* رأس الإشعار */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTypeIcon(reference.type)}</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">مرجع قانوني جديد</div>
              <div className="text-xs text-gray-500">{getTypeText(reference.type)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* تفاصيل المرجع */}
        <div className="space-y-2 mb-4">
          <div>
            <div className="font-medium text-gray-800 text-sm">{reference.title}</div>
            <div className="text-xs text-gray-600">{reference.source}</div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            {reference.year && (
              <span className="text-gray-500">السنة: {reference.year}</span>
            )}
            <span className={`font-medium ${getValidityColor(reference.validity)}`}>
              {getValidityText(reference.validity)}
            </span>
          </div>

          {reference.court && (
            <div className="text-xs text-gray-600">
              المحكمة: {reference.court}
            </div>
          )}

          {reference.notes && (
            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
              {reference.notes}
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            عرض التفاصيل
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            إغلاق
          </button>
        </div>

        {/* مؤشر التقدم */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
