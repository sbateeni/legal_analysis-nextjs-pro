import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthResponse } from '../../../types/auth';

// مفتاح JWT (في الإنتاج يجب أن يكون متغير بيئي)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { username, password, rememberMe }: AuthRequest = req.body;

    const normalizedUsername = (username || '').trim().toLowerCase();

    // التحقق من المدخلات
    if (!normalizedUsername || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'اسم المستخدم وكلمة المرور مطلوبان' 
      });
    }

    try {
      // البحث عن المستخدم في قاعدة البيانات
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          offices:office_id (
            id,
            name
          )
        `)
        .eq('username', normalizedUsername)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return res.status(401).json({ 
          success: false, 
          error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
        });
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
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
        officeId: user.office_id
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: rememberMe ? '30d' : '24h'
      });

      // تحديث آخر تسجيل دخول
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update last login error:', updateError);
        // لا نوقف العملية إذا فشل تحديث آخر تسجيل دخول
      }

      // إرسال الاستجابة
      const response: AuthResponse = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: '', // لا نرسل كلمة المرور في الاستجابة
          role: user.role,
          parentUserId: user.parent_user_id,
          officeId: user.office_id,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          isActive: user.is_active
        },
        token,
        message: 'تم تسجيل الدخول بنجاح'
      };

      return res.status(200).json(response);

    } catch (dbError) {
      console.error('Database error:', dbError);
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
