import type { NextApiRequest, NextApiResponse } from 'next';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import { RegisterRequest, AuthResponse, User, Office } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { username, email, password, confirmPassword, officeName }: RegisterRequest = req.body;

    // Auto-detect Vercel Blob token (with or without prefix)
    let BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
    if (!BLOB_TOKEN) {
      // Try to find prefixed token (e.g., VERCEL_BLOB_RW_*_READ_WRITE_TOKEN)
      const envKeys = Object.keys(process.env);
      const blobTokenKey = envKeys.find(key => key.includes('BLOB') && key.includes('READ_WRITE_TOKEN'));
      if (blobTokenKey) {
        BLOB_TOKEN = process.env[blobTokenKey];
      }
    }
    
    if (!BLOB_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'إعداد التخزين مفقود: يرجى ضبط المتغير BLOB_READ_WRITE_TOKEN في البيئة (ملف .env.local) ثم إعادة تشغيل الخادم.'
      });
    }

    // Normalize inputs
    const normalizedUsername = (username || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedOfficeName = (officeName || '').trim();

    // التحقق من المدخلات
    if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword || !normalizedOfficeName) {
      return res.status(400).json({ 
        success: false, 
        error: 'جميع الحقول مطلوبة' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'كلمتا المرور غير متطابقتين' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      });
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        error: 'البريد الإلكتروني غير صحيح' 
      });
    }

    try {
      // قراءة المستخدمين الموجودين
      const { blobs } = await list({ token: BLOB_TOKEN });
      const usersBlobName = 'users.json';
      const officesBlobName = 'offices.json';
      
      let users: User[] = [];
      let offices: Office[] = [];
      
      // قراءة المستخدمين
      const usersFile = blobs.find(blob => blob.pathname === usersBlobName);
      if (usersFile) {
        const response = await fetch(usersFile.url);
        users = await response.json();
      }

      // قراءة المكاتب
      const officesFile = blobs.find(blob => blob.pathname === officesBlobName);
      if (officesFile) {
        const response = await fetch(officesFile.url);
        offices = await response.json();
      }

      // التحقق من عدم تكرار اسم المستخدم (بدون مسافات وبلا تمييز حالة الأحرف)
      if (users.some(u => (u.username || '').trim().toLowerCase() === normalizedUsername.toLowerCase())) {
        return res.status(400).json({ 
          success: false, 
          error: 'اسم المستخدم مستخدم بالفعل' 
        });
      }

      // التحقق من عدم تكرار البريد الإلكتروني (بدون مسافات وبلا تمييز حالة الأحرف)
      if (users.some(u => (u.email || '').trim().toLowerCase() === normalizedEmail)) {
        return res.status(400).json({ 
          success: false, 
          error: 'البريد الإلكتروني مستخدم بالفعل' 
        });
      }

      // التحقق من عدم تكرار اسم المكتب (بدون مسافات وبلا تمييز حالة الأحرف)
      if (offices.some(o => (o.name || '').trim().toLowerCase() === normalizedOfficeName.toLowerCase())) {
        return res.status(400).json({ 
          success: false, 
          error: 'اسم المكتب مستخدم بالفعل' 
        });
      }

      // تشفير كلمة المرور
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // إنشاء معرفات فريدة
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const officeId = `office_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // إنشاء المكتب
      const newOffice: Office = {
        id: officeId,
        name: normalizedOfficeName,
        ownerId: userId,
        createdAt: new Date(),
        employeeCount: 1
      };

      // إنشاء المستخدم
      const newUser: User = {
        id: userId,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin',
        officeId,
        createdAt: new Date(),
        isActive: true
      };

      // إضافة المستخدم والمكتب للقوائم
      users.push(newUser);
      offices.push(newOffice);

      // حفظ المستخدمين
      await put(usersBlobName, JSON.stringify(users, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN
      });

      // حفظ المكاتب
      await put(officesBlobName, JSON.stringify(offices, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN
      });

      // إرسال الاستجابة
      const response: AuthResponse = {
        success: true,
        message: 'تم إنشاء الحساب بنجاح'
      };

      return res.status(201).json(response);

    } catch (blobError) {
      console.error('Blob error:', blobError);
      return res.status(500).json({ 
        success: false, 
        error: 'خطأ في قاعدة البيانات' 
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'خطأ داخلي في الخادم' 
    });
  }
} 