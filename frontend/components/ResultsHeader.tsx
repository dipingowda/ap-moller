'use client';
import React from 'react';
import { Table2 } from 'lucide-react';

interface Props {
  rowcount: number;
}

export default function ResultsHeader({ rowcount }: Props) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Query Results</h2>
          <p className="text-sm text-slate-500 mt-1">{rowcount} rows returned</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
            <Table2 className="w-3 h-3 inline mr-1" />
            Table View
          </div>
        </div>
      </div>
    </div>
  );
}