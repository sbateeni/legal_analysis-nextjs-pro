// Types for Authentication System
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // كلمة المرور المشفرة
  role: 'admin' | 'employee';
  parentUserId?: string; // للموظفين، يشير لليوزر الرئيسي
  officeId: string; // معرف المكتب/الشركة
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  officeName: string; // اسم المكتب/الشركة
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface CreateEmployeeRequest {
  username: string;
  email: string;
  password: string;
  role: 'employee';
}

export interface Office {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  employeeCount: number;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: Date;
  rememberMe: boolean;
} 