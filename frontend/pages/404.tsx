import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

export default function Custom404() {
  const { theme } = useTheme();
  return (
    <div style={{fontFamily:'Tajawal, Arial, sans-serif', direction:'rtl', minHeight:'100vh', background: theme.background, color: theme.text, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'0 1rem'}}>
      <h1 style={{fontSize:64, fontWeight:900, marginBottom:0}}>404</h1>
      <h2 style={{fontSize:28, fontWeight:700, margin:'12px 0 24px 0'}}>الصفحة غير موجودة</h2>
      <p style={{fontSize:18, marginBottom:32}}>عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.</p>
      <Link href="/" style={{background: theme.accent2, color:'#fff', borderRadius:8, padding:'10px 28px', fontWeight:800, fontSize:18, textDecoration:'none', boxShadow:'0 2px 8px #6366f122', letterSpacing:1, transition:'background 0.2s'}}>العودة للصفحة الرئيسية</Link>
    </div>
  );
} 