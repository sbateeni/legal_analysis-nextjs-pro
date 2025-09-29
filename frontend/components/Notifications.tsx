import React, { useEffect } from 'react';

export type Notice = { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string };

export function Notifications({ notices, setNotices }: { notices: Notice[]; setNotices: React.Dispatch<React.SetStateAction<Notice[]>> }) {
  useEffect(() => {
    if (notices.length === 0) return;
    const timers = notices.map(n => setTimeout(() => setNotices(prev => prev.filter(x => x.id !== n.id)), 3000));
    return () => { timers.forEach(clearTimeout); };
  }, [notices, setNotices]);

  if (notices.length === 0) return null;
  return (
    <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notices.map(n => (
        <div key={n.id} className="card-panel" style={{ 
          padding: '8px 12px', 
          background: n.type === 'error' ? '#fef2f2' : 
                     n.type === 'success' ? '#ecfdf5' : 
                     n.type === 'warning' ? '#fffbeb' : 
                     '#eef2ff',
          borderColor: n.type === 'error' ? '#fecaca' : 
                      n.type === 'success' ? '#d1fae5' : 
                      n.type === 'warning' ? '#fde68a' : 
                      '#c7d2fe' 
        }}>
          {n.message}
        </div>
      ))}
    </div>
  );
}