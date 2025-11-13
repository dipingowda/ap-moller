'use client';
import React from 'react';

interface Props {
  columns: string[];
  rows: Array<Record<string, unknown>>;
}

export default function DataTable({ columns, rows }: Props) {
  return (
    <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Data Table</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                    {typeof row[col] === 'number' ? (row[col] as number).toLocaleString() : String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}