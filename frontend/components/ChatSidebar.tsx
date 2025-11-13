'use client';

import React from 'react';
import { Send, BarChart3, Loader2 } from 'lucide-react';




export interface QueryResultRow { [key: string]: unknown; }
export interface QueryResult {
  columns: string[];
  rows: QueryResultRow[];
  rowcount: number;
  sql?: string;
  summary?: string;
}





type Message = { role: 'user' | 'assistant'; content: string; data?:QueryResult };

interface Props {
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  sendMessage: () => Promise<void> | void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function ChatSidebar({ messages, input, setInput, loading, sendMessage, handleKeyPress }: Props) {
  return (
    <div className="w-96 bg-white border-r border-slate-200 flex flex-col">
      
    <div className="w-96 bg-linear-to-b from-[#0f1115] to-[#1a1d23] border-r border-slate-800/60 flex flex-col">
      <div className="p-6 border-b border-slate-800/50 bg-linear-to-b from-[#0f1115] to-[#1a1d23]">
        <h1 className="text-[1.7rem] font-semibold tracking-tight font-[Inter] bg-linear-to-r from-slate-100 via-slate-300 to-slate-400 bg-clip-text text-transparent">
          Analytics<span className="text-slate-500">Chat</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Ask questions about your data, get instant insights.
        </p>
      </div>
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
      <div
        key={idx}
        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
            msg.role === 'user'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-900'
          }`}
        >
          <p className="text-sm whitespace-pre-line">{msg.content}</p>

          {/* ✅ Show NL summary if available */}
          {msg.data?.summary && msg.role === 'assistant' && (
            <div className="mt-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
              {msg.data.summary}
            </div>
          )}
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


<div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-md">
  <div className="flex gap-2 items-center">
    <div className="flex-1 relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask a question..."
        className="w-full px-4 py-2.5 bg-linear-to-br from-white to-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-900 shadow-sm focus:outline-none focus:ring-[1.5px] focus:ring-slate-900/70 transition-all duration-200"
      />
      {/* Subtle glowing line animation */}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 ease-out peer-focus:w-full" />
    </div>

    <button
      onClick={sendMessage}
      disabled={loading || !input.trim()}
      className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : (
        <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-px" />
      )}
    </button>
  </div>
</div>

    </div>
  );
}