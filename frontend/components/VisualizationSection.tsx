'use client';
import React from 'react';
//import { BarChart3 } from 'lucide-react';
import SQLDisplay from './SQLDisplay';

interface Props {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  sql?: string;
}

export default function VisualizationSection({ columns, rows, sql }: Props) {
  if (!columns.length) return null;
  const valueKey =
    columns.find((c) => c.toLowerCase().includes('total') || c.toLowerCase().includes('count') || c.toLowerCase().includes('amount')) ||
    columns[1];
  const labelKey = columns[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Visualization</h3>
      </div>
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {rows.slice(0, 10).map((row, idx) => {
            const maxValue = Math.max(...rows.map((r) => Number(r[valueKey] ?? 0)));
            const value = Number(row[valueKey] ?? 0);
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const label = String(row[labelKey] ?? '');
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 truncate max-w-[120px]" title={label}>
                    {label.substring(0, 8)}...
                  </span>
                  <span className="font-medium text-slate-900">{value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SQLDisplay sql={sql} />
    </div>
  );
}