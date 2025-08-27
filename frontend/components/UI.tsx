import React from 'react';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'info' | 'ghost' | 'neutral';

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  style,
  type = 'button',
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}) {
  const base = 'btn';
  const map: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    info: 'btn-info',
    ghost: 'btn-ghost',
    neutral: '',
  };
  const cls = [base, map[variant]].filter(Boolean).join(' ');
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="card-ui" style={style}>
      {children}
    </div>
  );
}



