"use client";
import React from 'react';

export default function Button({ children, className = '', ...props }: any) {
  return (
    <button {...props} className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-brand text-white hover:opacity-95 ${className}`}>
      {children}
    </button>
  );
}
