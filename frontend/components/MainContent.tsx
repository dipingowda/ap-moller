'use client';
import React from 'react';
import ResultsHeader from './ResultsHeader';
import DataTable from './DataTable';
import VisualizationSection from './VisualizationSection';
import { BarChart3 } from 'lucide-react';

interface QueryResult {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  rowcount: number;
  sql?: string;
}

interface Props {
  currentData: QueryResult | null;
}

export default function MainContent({ currentData }: Props) {
  if (!currentData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Data Yet</h2>
          <p className="text-slate-500">Start a conversation to see analytics and insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <ResultsHeader rowcount={currentData.rowcount} />
      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
          <DataTable columns={currentData.columns} rows={currentData.rows} />
          <VisualizationSection columns={currentData.columns} rows={currentData.rows} sql={currentData.sql} />
        </div>
      </div>
    </div>
  );
}