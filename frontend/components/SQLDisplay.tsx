'use client';
import React from 'react';

interface Props {
  sql?: string;
}

export default function SQLDisplay({ sql }: Props) {
  return (
    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
      <p className="text-xs font-semibold text-slate-600 mb-2">SQL Query</p>
      <pre className="text-xs text-slate-700 overflow-x-auto font-mono">{sql}</pre>
    </div>
  );
}