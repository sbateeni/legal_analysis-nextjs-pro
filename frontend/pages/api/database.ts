// API للوصول لقاعدة البيانات المركزية
import { NextApiRequest, NextApiResponse } from 'next';
import { centralDB } from '../../utils/central-db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  // تهيئة قاعدة البيانات المركزية
  try {
    await centralDB.init();
  } catch (error) {
    console.error('Failed to initialize central database:', error);
    return res.status(500).json({ error: 'Database initialization failed' });
  }

  try {
    switch (method) {
      case 'POST':
        return await handlePostRequest(body, res);
      
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePostRequest(body: unknown, res: NextApiResponse) {
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  
  const { action, data, userId } = body as {
    action: string;
    data: unknown;
    userId: string;
  };

  switch (action) {
    // === إدارة المستخدمين ===
    case 'createUser':
      return await handleCreateUser(data, res);

    case 'getUserByEmail':
      return await handleGetUserByEmail(data, res);

    case 'getUserById':
      return await handleGetUserById(data, res);

    case 'updateUserLastLogin':
      return await handleUpdateUserLastLogin(data, res);

    case 'validateUserPassword':
      return await handleValidateUserPassword(data, res);

    // === إدارة القضايا ===
    case 'createCase':
      return await handleCreateCase(data, res);

    case 'getUserCases':
      return await handleGetUserCases(userId, res);

    case 'getCase':
      return await handleGetCase(data, res);

    case 'updateCase':
      return await handleUpdateCase(data, res);

    case 'deleteCase':
      return await handleDeleteCase(data, res);

    // === إدارة المراحل ===
    case 'createStage':
      return await handleCreateStage(data, res);

    case 'getStagesForCase':
      return await handleGetStagesForCase(data, res);

    // === إدارة الاشتراكات ===
    case 'createSubscription':
      return await handleCreateSubscription(data, res);

    case 'getUserSubscription':
      return await handleGetUserSubscription(userId, res);

    // === إدارة التفضيلات ===
    case 'setUserPreference':
      return await handleSetUserPreference(data, res);

    case 'getUserPreference':
      return await handleGetUserPreference(data, res);

    // === الإحصائيات ===
    case 'getUserStats':
      return await handleGetUserStats(userId, res);

    default:
      return res.status(400).json({ error: 'Action not supported' });
  }
}

// === معالجات إدارة المستخدمين ===
async function handleCreateUser(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { email, password, fullName } = data as {
      email: string;
      password: string;
      fullName: string;
    };
    
    // التحقق من البيانات
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // التحقق من عدم وجود المستخدم
    const existingUser = await centralDB.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // إنشاء المستخدم
    const userId = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await centralDB.createUser({
      id: userId,
      email,
      password_hash: hashedPassword,
      fullName,
      createdAt: now,
      subscriptionType: 'free',
      lastLogin: null,
      isActive: true
    });

    // إنشاء اشتراك مجاني
    const subscriptionId = crypto.randomUUID();
    const freeEndDate = new Date();
    freeEndDate.setFullYear(freeEndDate.getFullYear() + 1); // سنة مجانية

    await centralDB.createSubscription({
      id: subscriptionId,
      userId,
      planType: 'free',
      startDate: now,
      endDate: freeEndDate.toISOString(),
      status: 'active'
    });

    return res.json({ 
      success: true, 
      userId,
      message: 'تم إنشاء المستخدم بنجاح' 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

async function handleGetUserByEmail(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { email } = data as { email: string };
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await centralDB.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // إزالة كلمة المرور من النتيجة
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Get user by email error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

async function handleGetUserById(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { id } = data as { id: string };
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await centralDB.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // إزالة كلمة المرور من النتيجة
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

async function handleUpdateUserLastLogin(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { id } = data as { id: string };
    
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await centralDB.updateUserLastLogin(id);
    return res.json({ success: true, message: 'Last login updated' });
  } catch (error) {
    console.error('Update last login error:', error);
    return res.status(500).json({ error: 'Failed to update last login' });
  }
}

async function handleValidateUserPassword(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { email, password } = data as { email: string; password: string };
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await centralDB.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // تحديث آخر تسجيل دخول
    await centralDB.updateUserLastLogin(user.id);

    // إزالة كلمة المرور من النتيجة
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Validate password error:', error);
    return res.status(500).json({ error: 'Failed to validate password' });
  }
}

// === معالجات إدارة القضايا ===
async function handleCreateCase(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { userId, name, caseType, partyRole, complexity, status, tags, description } = data as {
      userId: string;
      name: string;
      caseType?: string;
      partyRole?: string;
      complexity?: 'basic' | 'intermediate' | 'advanced';
      status?: 'active' | 'archived' | 'completed';
      tags?: string;
      description?: string;
    };
    
    if (!userId || !name) {
      return res.status(400).json({ error: 'User ID and case name are required' });
    }

    const caseId = crypto.randomUUID();
    await centralDB.createCase({
      id: caseId,
      userId,
      name,
      caseType: caseType || 'مدني',
      partyRole: partyRole || 'مدعي',
      complexity: complexity || 'basic',
      status: status || 'active',
      tags,
      description
    });

    return res.json({ success: true, caseId, message: 'تم إنشاء القضية بنجاح' });
  } catch (error) {
    console.error('Create case error:', error);
    return res.status(500).json({ error: 'Failed to create case' });
  }
}

async function handleGetUserCases(userId: string, res: NextApiResponse) {
  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const cases = await centralDB.getUserCases(userId);
    return res.json({ success: true, cases });
  } catch (error) {
    console.error('Get user cases error:', error);
    return res.status(500).json({ error: 'Failed to get user cases' });
  }
}

async function handleGetCase(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { id, userId } = data as { id: string; userId: string };
    
    if (!id || !userId) {
      return res.status(400).json({ error: 'Case ID and User ID are required' });
    }

    const caseItem = await centralDB.getCase(id, userId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    return res.json({ success: true, case: caseItem });
  } catch (error) {
    console.error('Get case error:', error);
    return res.status(500).json({ error: 'Failed to get case' });
  }
}

async function handleUpdateCase(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { id, userId, updates } = data as { id: string; userId: string; updates: unknown };
    
    if (!id || !userId || !updates) {
      return res.status(400).json({ error: 'Case ID, User ID, and updates are required' });
    }

    await centralDB.updateCase(id, userId, updates);
    return res.json({ success: true, message: 'تم تحديث القضية بنجاح' });
  } catch (error) {
    console.error('Update case error:', error);
    return res.status(500).json({ error: 'Failed to update case' });
  }
}

async function handleDeleteCase(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { id, userId } = data as { id: string; userId: string };
    
    if (!id || !userId) {
      return res.status(400).json({ error: 'Case ID and User ID are required' });
    }

    await centralDB.deleteCase(id, userId);
    return res.json({ success: true, message: 'تم حذف القضية بنجاح' });
  } catch (error) {
    console.error('Delete case error:', error);
    return res.status(500).json({ error: 'Failed to delete case' });
  }
}

// === معالجات إدارة المراحل ===
async function handleCreateStage(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { caseId, userId, stageName, stageIndex, input, output, status, metadata } = data as {
      caseId: string;
      userId: string;
      stageName: string;
      stageIndex: number;
      input?: string;
      output?: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'failed';
      metadata?: string;
    };
    
    if (!caseId || !userId || !stageName || stageIndex === undefined) {
      return res.status(400).json({ error: 'Case ID, User ID, Stage Name, and Stage Index are required' });
    }

    const stageId = crypto.randomUUID();
    await centralDB.createStage({
      id: stageId,
      caseId,
      userId,
      stageName,
      stageIndex,
      input: input || '',
      output: output || '',
      status: status || 'pending',
      metadata
    });

    return res.json({ success: true, stageId, message: 'تم إنشاء المرحلة بنجاح' });
  } catch (error) {
    console.error('Create stage error:', error);
    return res.status(500).json({ error: 'Failed to create stage' });
  }
}

async function handleGetStagesForCase(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { caseId, userId } = data as { caseId: string; userId: string };
    
    if (!caseId || !userId) {
      return res.status(400).json({ error: 'Case ID and User ID are required' });
    }

    const stages = await centralDB.getStagesForCase(caseId, userId);
    return res.json({ success: true, stages });
  } catch (error) {
    console.error('Get stages error:', error);
    return res.status(500).json({ error: 'Failed to get stages' });
  }
}

// === معالجات إدارة الاشتراكات ===
async function handleCreateSubscription(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { userId, planType, startDate, endDate } = data as {
      userId: string;
      planType: 'free' | 'monthly' | 'yearly';
      startDate: string;
      endDate: string;
    };
    
    if (!userId || !planType || !startDate || !endDate) {
      return res.status(400).json({ error: 'All subscription fields are required' });
    }

    const subscriptionId = crypto.randomUUID();
    await centralDB.createSubscription({
      id: subscriptionId,
      userId,
      planType,
      startDate,
      endDate,
      status: 'active'
    });

    return res.json({ success: true, subscriptionId, message: 'تم إنشاء الاشتراك بنجاح' });
  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}

async function handleGetUserSubscription(userId: string, res: NextApiResponse) {
  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const subscription = await centralDB.getUserSubscription(userId);
    return res.json({ success: true, subscription });
  } catch (error) {
    console.error('Get user subscription error:', error);
    return res.status(500).json({ error: 'Failed to get user subscription' });
  }
}

// === معالجات إدارة التفضيلات ===
async function handleSetUserPreference(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { userId, key, value } = data as { userId: string; key: string; value: string };
    
    if (!userId || !key || value === undefined) {
      return res.status(400).json({ error: 'User ID, Key, and Value are required' });
    }

    await centralDB.setUserPreference(userId, key, value);
    return res.json({ success: true, message: 'تم حفظ التفضيل بنجاح' });
  } catch (error) {
    console.error('Set user preference error:', error);
    return res.status(500).json({ error: 'Failed to set user preference' });
  }
}

async function handleGetUserPreference(data: unknown, res: NextApiResponse) {
  try {
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const { userId, key } = data as { userId: string; key: string };
    
    if (!userId || !key) {
      return res.status(400).json({ error: 'User ID and Key are required' });
    }

    const value = await centralDB.getUserPreference(userId, key);
    return res.json({ success: true, value });
  } catch (error) {
    console.error('Get user preference error:', error);
    return res.status(500).json({ error: 'Failed to get user preference' });
  }
}

// === معالجات الإحصائيات ===
async function handleGetUserStats(userId: string, res: NextApiResponse) {
  try {
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stats = await centralDB.getUserStats(userId);
    return res.json({ success: true, stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({ error: 'Failed to get user stats' });
  }
}
