'use client';

import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import ChatSidebar from '@/components/ChatSidebar';

export interface QueryResultRow {
  [key: string]: unknown;
}

export interface QueryResult {
  columns: string[];
  rows: QueryResultRow[];
  rowcount: number;
  sql?: string;
  summary?: string;
}



export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; data?: QueryResult }>>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentData, setCurrentData] = useState<QueryResult | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: { role: 'user' | 'assistant'; content: string; data?: QueryResult } = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();
      
      setCurrentData(data);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Found ${data.rowcount} results`,
        data: data 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error fetching data. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (

    <div className="flex h-screen bg-linear-to-br from-slate-50 to-slate-100">
      
      
      {/* Chat Sidebar */}
       {/* <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900">Analytics Chat</h1>
          <p className="text-sm text-slate-500 mt-1">Ask questions about your data</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Start a conversation</p>
              <p className="text-sm text-slate-400 mt-1">Ask about your data to get insights</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-900'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}   // ✅ change this line
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div> */}

      <ChatSidebar
      messages={messages}
      input={input}
      setInput={setInput}
      loading={loading}
      sendMessage={sendMessage}
      handleKeyPress={handleKeyPress}
    />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {currentData ? (
          <>
            {/* Header */}
            <div className="bg-linear-to-b from-[#0f1115] to-[#1a1d23]  border-b border-slate-200 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Query Results</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentData.rowcount} rows returned
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                    <Table2 className="w-3 h-3 inline mr-1" />
                    Table View
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-auto p-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                {/* Table Section */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Data Table</h3>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          {(currentData?.columns ?? []).map((col, idx) => (
                            <th key={idx} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                              {String(col).replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {(currentData?.rows ?? []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            {(currentData?.columns ?? []).map((col, colIdx) => (
                              <td key={colIdx} className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap">
                                {typeof (row as Record<string, unknown>)[col] === 'number'
                                    ? Number((row as Record<string, unknown>)[col]).toLocaleString()
                                    : String((row as Record<string, unknown>)[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Visualization Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Visualization</h3>
                  </div>
                  <div className="flex-1 p-6">
                    {/* Bar Chart Visualization */}
                    <div className="space-y-3">
                      {(currentData?.rows ?? []).slice(0, 10).map((row, idx) => {
                        const cols = currentData?.columns ?? [];
                        const valueKey =
                          cols.find((col) =>
                            String(col).toLowerCase().includes('total') ||
                            String(col).toLowerCase().includes('count') ||
                            String(col).toLowerCase().includes('amount')
                          ) || cols[1] || '';

                        const labelKey = cols[0] || '';
                        const maxValue = Math.max(...(currentData?.rows ?? []).map(r => Number((r as Record<string, unknown>)[valueKey] ?? 0)));
                        const value = Number((row as Record<string, unknown>)[valueKey] ?? 0);
                        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        const label = String((row as Record<string, unknown>)[labelKey] ?? '');

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600 truncate max-w-[120px]" title={label}>
                                {label.substring(0, 8)}...
                              </span>
                              <span className="font-medium text-slate-900">
                                {value.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-slate-900 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* SQL Query Display */}

                  <div className="px-6 py-4 border-t  border-slate-200 bg-linear-to-b from-slate-50 to-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-m font-bold tracking-wide text-slate-600 uppercase">
                        SQL Query
                      </p>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentData.sql || "");
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-all duration-200 shadow-sm active:scale-[0.97]"
                        title="Copy SQL"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 4h6a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-6z"
                          />
                        </svg>
                        Copy
                      </button>
                    </div>

                    <pre 
                      className="text-sm text-slate-800 bg-amber-100 border border-slate-200 rounded-lg px-4 py-3 overflow-x-auto font-['JetBrains_Mono'] shadow-inner leading-relaxed"
                      style={{
                        fontFamily: `'JetBrains Mono', 'IBM Plex Mono', monospace`,
                        fontWeight: 500,
                      }}
                    >
                      {currentData.sql}
                    </pre>
                  </div>

                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">No Data Yet</h2>
              <p className="text-slate-500">Start a conversation to see analytics and insights</p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}