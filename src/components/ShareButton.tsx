"use client";
import React from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ShareButton({ title, className, children }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      {children || <><Share2 className="w-3.5 h-3.5" /> Share</>}
    </button>
  );
}
