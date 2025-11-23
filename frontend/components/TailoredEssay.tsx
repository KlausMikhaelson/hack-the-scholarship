'use client';

import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check } from 'lucide-react';

interface TailoredEssayProps {
  essay: string;
  onRegenerate?: () => void;
}

export default function TailoredEssay({ essay, onRegenerate }: TailoredEssayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([essay], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tailored-essay.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Step 4</span>
            <h3 className="text-lg font-semibold text-[#111]">Tailored Essay Draft</h3>
          </div>
          <p className="text-sm text-gray-500 ml-[70px]">
            AI-generated essay optimized for this specific scholarship.
          </p>
        </div>

        <div className="flex gap-2 ml-[70px] md:ml-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-xs font-medium shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-100 p-8">
        <div className="prose prose-sm prose-slate max-w-none">
          {essay.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-800 mb-4 leading-relaxed last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

