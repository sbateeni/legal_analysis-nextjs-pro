import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAllCases, addDocument, getDocumentSettings } from '@utils/db';

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

interface LegalDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'txt' | 'other';
  size: number;
  caseId?: string;
  caseName?: string;
  description?: string;
  category: 'contract' | 'evidence' | 'correspondence' | 'legal_opinion' | 'court_document' | 'other';
  uploadedAt: string;
  lastModified: string;
  tags?: string[];
  isPublic: boolean;
  filePath?: string;
  mimeType?: string;
}

interface DocumentSettings {
  maxFileSize: number;
  allowedTypes: string[];
  storageLocation: 'local' | 'cloud';
  autoBackup: boolean;
  compressionEnabled: boolean;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUploaded: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  document?: LegalDocument;
}

export default function FileUploadModal({ isOpen, onClose, onFilesUploaded }: FileUploadModalProps) {
  const { theme } = useTheme();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [settings, setSettings] = useState<DocumentSettings | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const [isPublic, setIsPublic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [allCases, documentSettings] = await Promise.all([
        getAllCases(),
        getDocumentSettings()
      ]);

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
      setSettings(documentSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getFileType = (filename: string): LegalDocument['type'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'doc': return 'doc';
      case 'docx': return 'docx';
      case 'jpg':
      case 'jpeg': return 'jpg';
      case 'png': return 'png';
      case 'txt': return 'txt';
      default: return 'other';
    }
  };

  const validateFile = (file: File): string | null => {
    if (!settings) return 'جاري تحميل الإعدادات...';

    // Check file size
    if (file.size > settings.maxFileSize) {
      return `حجم الملف كبير جداً. الحد الأقصى: ${formatFileSize(settings.maxFileSize)}`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !settings.allowedTypes.includes(fileExtension)) {
      return `نوع الملف غير مدعوم. الأنواع المدعومة: ${settings.allowedTypes.join(', ')}`;
    }

    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newUploadFiles: UploadFile[] = [];

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        newUploadFiles.push({
          file,
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          progress: 0,
          status: 'error',
          error: validationError
        });
      } else {
        newUploadFiles.push({
          file,
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          progress: 0,
          status: 'pending'
        });
      }
    });

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [settings]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileProgress = (fileId: string, progress: number) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress } : f
    ));
  };

  const updateFileStatus = (fileId: string, status: UploadFile['status'], error?: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status, error } : f
    ));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      updateFileStatus(uploadFile.id, 'uploading');
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        updateFileProgress(uploadFile.id, progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const selectedCaseData = cases.find(c => c.id === selectedCase);
      const document: LegalDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: uploadFile.file.name,
        type: getFileType(uploadFile.file.name),
        size: uploadFile.file.size,
        caseId: selectedCase || undefined,
        caseName: selectedCaseData?.name,
        description: '',
        category: selectedCategory as any,
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        isPublic,
        mimeType: uploadFile.file.type
      };

      await addDocument(document);
      updateFileStatus(uploadFile.id, 'completed');
      
      // Store the document reference
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, document } : f
      ));

    } catch (error) {
      console.error('Error uploading file:', error);
      updateFileStatus(uploadFile.id, 'error', 'حدث خطأ أثناء رفع الملف');
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
    
    // Check if all files are completed
    const allCompleted = uploadFiles.every(f => f.status === 'completed' || f.status === 'error');
    if (allCompleted) {
      onFilesUploaded();
      onClose();
      setUploadFiles([]);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'uploading': return '📤';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'uploading': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
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
        maxWidth: '600px',
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
            📤 رفع المستندات
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

        {/* Upload Settings */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
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
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
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

          <div>
            <label style={{
              display: 'block',
              color: theme.text,
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              فئة المستند
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              <option value="contract">عقد</option>
              <option value="evidence">دليل</option>
              <option value="correspondence">مراسلة</option>
              <option value="legal_opinion">رأي قانوني</option>
              <option value="court_document">مستند قضائي</option>
              <option value="other">أخرى</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            style={{
              width: '16px',
              height: '16px'
            }}
          />
          <label htmlFor="isPublic" style={{
            color: theme.text,
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            جعل المستندات عامة
          </label>
        </div>

        {/* Drop Zone */}
        <div
          style={{
            border: `2px dashed ${dragActive ? theme.accent : theme.border}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            background: dragActive ? theme.resultBg : 'transparent',
            transition: 'all 0.2s ease'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            📁
          </div>
          <h3 style={{
            color: theme.text,
            margin: '0 0 8px 0',
            fontSize: '18px'
          }}>
            {dragActive ? 'أفلت الملفات هنا' : 'انقر لاختيار الملفات أو اسحبها هنا'}
          </h3>
          <p style={{
            color: theme.text,
            margin: '0',
            fontSize: '14px',
            opacity: 0.7
          }}>
            يدعم: PDF, DOC, DOCX, JPG, PNG, TXT
          </p>
          {settings && (
            <p style={{
              color: theme.text,
              margin: '8px 0 0 0',
              fontSize: '12px',
              opacity: 0.6
            }}>
              الحد الأقصى: {formatFileSize(settings.maxFileSize)}
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div style={{
            marginBottom: '20px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <h3 style={{
              color: theme.text,
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              الملفات المحددة ({uploadFiles.length})
            </h3>
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: theme.resultBg,
                marginBottom: '8px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ fontSize: '20px' }}>
                  {getStatusIcon(uploadFile.status)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: theme.text,
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    wordBreak: 'break-word'
                  }}>
                    {uploadFile.file.name}
                  </p>
                  <p style={{
                    color: theme.text,
                    margin: '0',
                    fontSize: '12px',
                    opacity: 0.7
                  }}>
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: theme.border,
                      borderRadius: '2px',
                      marginTop: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadFile.progress}%`,
                        height: '100%',
                        background: getStatusColor(uploadFile.status),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                  {uploadFile.error && (
                    <p style={{
                      color: '#ef4444',
                      margin: '4px 0 0 0',
                      fontSize: '12px'
                    }}>
                      {uploadFile.error}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.text,
                    fontSize: '16px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    opacity: 0.5
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
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
          {uploadFiles.length > 0 && (
            <button
              onClick={uploadAllFiles}
              disabled={uploadFiles.some(f => f.status === 'uploading')}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: theme.accent,
                color: '#fff',
                fontSize: '14px',
                cursor: uploadFiles.some(f => f.status === 'uploading') ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: uploadFiles.some(f => f.status === 'uploading') ? 0.7 : 1
              }}
            >
              {uploadFiles.some(f => f.status === 'uploading') ? 'جاري الرفع...' : 'رفع الملفات'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
