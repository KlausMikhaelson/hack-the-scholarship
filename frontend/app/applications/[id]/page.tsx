'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Download, Copy, Check, Sparkles } from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [essay, setEssay] = useState(`As a Computer Science student with a 3.8 GPA, I am deeply passionate about leveraging my skills to create meaningful impact in my community and beyond. The Gates Millennium Scholarship aligns perfectly with my values and aspirations.

Throughout my academic journey, I have consistently demonstrated excellence not just in the classroom, but in applying my knowledge to real-world challenges. My work as Robotics Club Captain exemplifies my commitment to innovation and pushing boundaries.

Leadership has been a cornerstone of my personal development. Through my volunteer tutoring work, I have learned the importance of collaboration, empathy, and inspiring others to work toward common goals.`);
  
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiMenuPosition, setAiMenuPosition] = useState({ x: 0, y: 0 });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedEssay: essay }),
      });
      alert('Essay saved!');
    } catch (error) {
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

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
    a.download = 'scholarship-essay.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setAiMenuPosition({ x: rect.left, y: rect.bottom + window.scrollY });
        setShowAiMenu(true);
      }
    } else {
      setShowAiMenu(false);
    }
  };

  const handleAiImprove = async (mode: string) => {
    const improvementMap: Record<string, string> = {
      clearer: 'Make this clearer and more direct',
      emotional: 'Make this more emotional and personal',
      academic: 'Make this more formal and academic',
      simpler: 'Simplify this language',
    };

    // Mock AI improvement
    alert(`AI would improve the selected text to be ${mode}. (API integration pending)`);
    setShowAiMenu(false);
  };

  return (
    <>
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#111] mb-2">Gates Millennium Scholarship</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                  IN PROGRESS
                </span>
                <span className="text-sm text-gray-500">Last saved 5 minutes ago</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Essay Editor</h2>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Select text for AI suggestions</span>
            </div>
          </div>
          
          <div className="p-8">
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              onMouseUp={handleTextSelection}
              className="w-full min-h-[500px] border-0 focus:ring-0 outline-none text-gray-800 leading-relaxed resize-y"
              style={{ fontSize: '15px', lineHeight: '1.7' }}
            />
          </div>
        </div>

        {/* AI Suggestion Menu */}
        {showAiMenu && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
            style={{ left: aiMenuPosition.x, top: aiMenuPosition.y + 8 }}
          >
            <p className="text-xs text-gray-500 px-2 py-1 mb-1">Improve with AI</p>
            <button
              onClick={() => handleAiImprove('clearer')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Make clearer
            </button>
            <button
              onClick={() => handleAiImprove('emotional')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              More emotional
            </button>
            <button
              onClick={() => handleAiImprove('academic')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              More academic
            </button>
            <button
              onClick={() => handleAiImprove('simpler')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              Simplify
            </button>
          </div>
        )}
      </div>
    </>
  );
}

