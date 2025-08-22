import CryptoJS from "crypto-js";

const SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET!;

export function encrypt(text: string) {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

export function decrypt(cipher: string) {
  return CryptoJS.AES.decrypt(cipher, SECRET).toString(CryptoJS.enc.Utf8);
}

// دالة مساعدة لمعرفة إذا كان العرض صغير (جوال)
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768; // زيادة الحد ليشمل المزيد من الأجهزة
}

// دالة أكثر دقة لمعرفة حجم الشاشة
export function getScreenSize() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  if (width <= 1024) return 'small-desktop';
  return 'desktop';
}

// دالة للتحقق من أن الشاشة صغيرة جداً
export function isSmallScreen() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 480;
} 