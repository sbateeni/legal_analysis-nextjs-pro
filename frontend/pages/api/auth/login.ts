import type { NextApiRequest, NextApiResponse } from 'next';
import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthResponse, User } from '../../../types/auth';

// مفتاح JWT (في الإنتاج يجب أن يكون متغير بيئي)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { username, password, rememberMe }: AuthRequest = req.body;

    const normalizedUsername = (username || '').trim().toLowerCase();

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

    // التحقق من المدخلات
    if (!normalizedUsername || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'اسم المستخدم وكلمة المرور مطلوبان' 
      });
    }

    // البحث عن المستخدم في Vercel Blob
    const usersBlobName = 'users.json';
    
    try {
      // محاولة قراءة ملف المستخدمين
      const { blobs } = await list({ token: BLOB_TOKEN });
      const usersFile = blobs.find(blob => blob.pathname === usersBlobName);
      
      let users: User[] = [];
      
      if (usersFile) {
        // قراءة المستخدمين الموجودين
        const response = await fetch(usersFile.url);
        users = await response.json();
      }

      // البحث عن المستخدم
      const user = users.find(u => (u.username || '').trim().toLowerCase() === normalizedUsername && u.isActive);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
        });
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
        });
      }

      // إنشاء JWT token
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        officeId: user.officeId
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: rememberMe ? '30d' : '24h'
      });

      // تحديث آخر تسجيل دخول
      user.lastLogin = new Date();
      
      // حفظ التحديثات
      await put(usersBlobName, JSON.stringify(users, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        token: BLOB_TOKEN
      });

      // إرسال الاستجابة
      const response: AuthResponse = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: '', // لا نرسل كلمة المرور في الاستجابة
          role: user.role,
          parentUserId: user.parentUserId,
          officeId: user.officeId,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive
        },
        token,
        message: 'تم تسجيل الدخول بنجاح'
      };

      return res.status(200).json(response);

    } catch (blobError) {
      console.error('Blob error:', blobError);
      return res.status(500).json({ 
        success: false, 
        error: 'خطأ في قاعدة البيانات' 
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'خطأ داخلي في الخادم' 
    });
  }
} 