import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'error' | 'warning' | 'success' | 'outline';
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  let classes = "px-2 py-0.5 rounded-full font-mono-data-sm text-mono-data-sm font-semibold inline-flex items-center gap-1 ";
  
  switch (variant) {
    case 'primary':
      classes += "bg-primary-container text-on-primary-container";
      break;
    case 'error':
      classes += "bg-error text-on-error";
      break;
    case 'warning':
      classes += "bg-[#B54708] text-white"; // Using exact amber from Stitch tokens
      break;
    case 'success':
      classes += "bg-tertiary-container text-on-tertiary-container";
      break;
    case 'outline':
      classes += "border border-outline-variant text-on-surface-variant bg-surface";
      break;
  }

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
