'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Download, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [essay, setEssay] = useState('');
  const [scholarshipName, setScholarshipName] = useState('');
  const [status, setStatus] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiMenuPosition, setAiMenuPosition] = useState({ x: 100, y: 100 });
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplication() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/applications/${applicationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        
        const data = await response.json();
        const app = data.application;
        
        setScholarshipName(app.scholarshipName || 'Unknown Scholarship');
        setStatus(app.status || 'DRAFT');
        setEssay(app.editedEssay || app.generatedEssay || '');
        setLastSaved(app.updatedAt ? new Date(app.updatedAt) : null);
      } catch (err) {
        console.error('Application fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load application');
      } finally {
        setIsLoading(false);
      }
    }

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  // Close AI menu when clicking outside
  useEffect(() => {
    if (!showAiMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on the menu itself
      if (target.closest('[data-ai-menu]')) {
        return;
      }
      // Don't close if clicking in the textarea (selection might be happening)
      if (target.tagName === 'TEXTAREA' || target.closest('textarea')) {
        return;
      }
      setShowAiMenu(false);
    };

    // Use a small delay to avoid closing immediately when selection happens
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showAiMenu]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          editedEssay: essay,
          status: status === 'DRAFT' ? 'IN_PROGRESS' : status,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save');
      }
      
      setLastSaved(new Date());
      setStatus('IN_PROGRESS');
      alert('Essay saved!');
    } catch (error) {
      alert('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffInMs = now.getTime() - lastSaved.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return lastSaved.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-500">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>
          </div>
        </div>
    );
  }

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

  const handleTextSelection = (e?: React.SyntheticEvent) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (!textarea) {
        setShowAiMenu(false);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end).trim();
      
      console.log('Selection text:', selectedText, 'Length:', selectedText.length);
      
      if (selectedText && selectedText.length > 0) {
        setSelectedText(selectedText);
        
        try {
          // For textarea, we need to calculate position based on cursor position
          // Create a mirror div to measure text position
          const textareaRect = textarea.getBoundingClientRect();
          const textareaStyle = window.getComputedStyle(textarea);
          
          // Get the text before selection to calculate line/column
          const textBeforeSelection = textarea.value.substring(0, start);
          const lines = textBeforeSelection.split('\n');
          const currentLine = lines.length - 1;
          const currentColumn = lines[currentLine]?.length || 0;
          
          // Create a temporary span to measure text position
          const mirror = document.createElement('div');
          mirror.style.position = 'absolute';
          mirror.style.visibility = 'hidden';
          mirror.style.whiteSpace = 'pre-wrap';
          mirror.style.font = textareaStyle.font;
          mirror.style.fontSize = textareaStyle.fontSize;
          mirror.style.fontFamily = textareaStyle.fontFamily;
          mirror.style.lineHeight = textareaStyle.lineHeight;
          mirror.style.padding = textareaStyle.padding;
          mirror.style.border = textareaStyle.border;
          mirror.style.width = textareaStyle.width;
          mirror.style.wordWrap = 'break-word';
          mirror.textContent = textBeforeSelection;
          
          document.body.appendChild(mirror);
          
          // Get the position of the selection start
          const span = document.createElement('span');
          span.textContent = selectedText.substring(0, 1) || '|';
          mirror.appendChild(span);
          
          const spanRect = span.getBoundingClientRect();
          const mirrorRect = mirror.getBoundingClientRect();
          
          document.body.removeChild(mirror);
          
          // Calculate position relative to textarea
          const menuHeight = 220;
          const menuWidth = 180;
          const padding = 10;
          const gap = 8;
          
          // Position near the selection (use textarea position + estimated selection position)
          let x = textareaRect.left + padding;
          let y = textareaRect.top + (currentLine * parseFloat(textareaStyle.lineHeight) || 20) + gap;
          
          // Adjust to keep within viewport
          if (x + menuWidth + padding > window.innerWidth) {
            x = window.innerWidth - menuWidth - padding;
          }
          if (x < padding) {
            x = padding;
          }
          
          const spaceBelow = window.innerHeight - y;
          const spaceAbove = y - menuHeight;
          
          if (spaceBelow < menuHeight + gap && spaceAbove >= menuHeight + gap) {
            // Position above
            y = y - menuHeight - gap;
          } else {
            // Position below
            y = y + gap;
          }
          
          // Ensure coordinates are valid and within viewport
          x = Math.max(padding, Math.min(x, window.innerWidth - menuWidth - padding));
          y = Math.max(padding, Math.min(y, window.innerHeight - menuHeight - padding));
          
          console.log('Setting menu position:', { x, y });
          setAiMenuPosition({ x, y });
          setShowAiMenu(true);
        } catch (error) {
          console.error('Error calculating position:', error);
          // Fallback: position near textarea
          const textareaRect = textarea.getBoundingClientRect();
          setAiMenuPosition({ 
            x: textareaRect.left + 10, 
            y: textareaRect.top + 50 
          });
          setShowAiMenu(true);
        }
      } else {
        setShowAiMenu(false);
      }
    }, 100);
  };

  const handleAiImprove = async (mode: string) => {
    if (!selectedText || selectedText.trim().length === 0) {
      alert('Please select some text first');
      setShowAiMenu(false);
      return;
    }

    try {
      setIsImproving(true);
      setShowAiMenu(false);
      
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (!textarea) {
        setIsImproving(false);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const originalText = textarea.value.substring(start, end);

      // Call the improvement API
      const response = await fetch('/api/essay/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText: originalText,
          mode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to improve text');
      }

      const data = await response.json();
      const improvedText = data.improvedText;

      // Replace the selected text with improved text
      const textBefore = textarea.value.substring(0, start);
      const textAfter = textarea.value.substring(end);
      const newText = textBefore + improvedText + textAfter;

      setEssay(newText);

      // Restore selection to the improved text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + improvedText.length);
        setIsImproving(false);
      }, 10);

    } catch (error) {
      console.error('Improvement error:', error);
      setIsImproving(false);
      alert(error instanceof Error ? error.message : 'Failed to improve text. Please try again.');
    }
  };

  return (
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
              <h1 className="text-2xl font-bold text-[#111] mb-2">{scholarshipName}</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  status === 'DRAFT' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                  status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  status === 'SUBMITTED' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {status.replace('_', ' ')}
                </span>
                {lastSaved && (
                  <span className="text-sm text-gray-500">Last saved {formatLastSaved()}</span>
                )}
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
          <div className="border-b border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Essay Editor</h2>
            <div className="flex items-center gap-2">
              {isImproving ? (
                <>
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs text-blue-600">Improving text...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-500">Select text for AI suggestions</span>
                </>
              )}
            </div>
          </div>
          
          <div className="p-8 relative">
            {isImproving && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <p className="text-sm text-gray-600">AI is improving your text...</p>
                </div>
              </div>
            )}
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              onSelect={handleTextSelection}
              onMouseDown={() => {
                // Clear selection when clicking
                setTimeout(() => {
                  const selection = window.getSelection();
                  if (selection && selection.toString().trim().length === 0) {
                    setShowAiMenu(false);
                  }
                }, 100);
              }}
              disabled={isImproving}
              className="w-full min-h-[500px] border-0 focus:ring-0 outline-none text-gray-800 leading-relaxed resize-y disabled:opacity-50"
              style={{ fontSize: '15px', lineHeight: '1.7' }}
            />
          </div>
        </div>

        {/* AI Suggestion Menu */}
        {showAiMenu && (
          <div
            data-ai-menu
            className="fixed bg-white border-2 border-blue-300 rounded-lg shadow-2xl p-2 z-[9999] min-w-[180px]"
            style={{ 
              left: `${aiMenuPosition.x}px`, 
              top: `${aiMenuPosition.y}px`,
              position: 'fixed',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
              <p className="text-xs font-medium text-gray-700 px-2 py-1.5 mb-1 border-b border-gray-100">Improve with AI</p>
              <div className="py-1">
                <button
                  onClick={() => handleAiImprove('clearer')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                  Make clearer
                </button>
                <button
                  onClick={() => handleAiImprove('emotional')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                  More emotional
                </button>
                <button
                  onClick={() => handleAiImprove('academic')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                  More academic
                </button>
                <button
                  onClick={() => handleAiImprove('simpler')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                >
                Simplify
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

