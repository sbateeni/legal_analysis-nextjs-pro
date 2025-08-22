import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';
import bcrypt from 'bcryptjs';
import { RegisterRequest, AuthResponse, User, Office } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { username, email, password, confirmPassword, officeName }: RegisterRequest = req.body;

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
      // التحقق من عدم تكرار اسم المستخدم
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', normalizedUsername)
        .single();

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'اسم المستخدم مستخدم بالفعل' 
        });
      }

      // التحقق من عدم تكرار البريد الإلكتروني
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', normalizedEmail)
        .single();

      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'البريد الإلكتروني مستخدم بالفعل' 
        });
      }

      // البحث عن المكتب أو إنشاؤه
      let officeId: number;
      
      const { data: existingOffice } = await supabase
        .from('offices')
        .select('id')
        .eq('name', normalizedOfficeName)
        .single();

      if (existingOffice) {
        officeId = existingOffice.id;
      } else {
        // إنشاء مكتب جديد
        const { data: newOffice, error: officeError } = await supabase
          .from('offices')
          .insert([{ name: normalizedOfficeName }])
          .select('id')
          .single();

        if (officeError) {
          console.error('Office creation error:', officeError);
          return res.status(500).json({ 
            success: false, 
            error: 'فشل في إنشاء المكتب' 
          });
        }

        officeId = newOffice.id;
      }

      // تشفير كلمة المرور
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // إنشاء المستخدم
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          username: normalizedUsername,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: 'user',
          office_id: officeId,
          is_active: true
        }])
        .select('*')
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        return res.status(500).json({ 
          success: false, 
          error: 'فشل في إنشاء المستخدم' 
        });
      }

      // إرسال الاستجابة
      const response: AuthResponse = {
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          password: '', // لا نرسل كلمة المرور
          role: newUser.role,
          parentUserId: newUser.parent_user_id,
          officeId: newUser.office_id,
          createdAt: newUser.created_at,
          lastLogin: newUser.last_login,
          isActive: newUser.is_active
        },
        token: '', // سيتم إنشاء token عند تسجيل الدخول
        message: 'تم إنشاء الحساب بنجاح'
      };

      return res.status(201).json(response);

    } catch (dbError) {
      console.error('Database error:', dbError);
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
