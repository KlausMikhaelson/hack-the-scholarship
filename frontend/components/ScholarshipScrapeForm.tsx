'use client';

import React, { useState } from 'react';
import { X, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScrapedData {
  name: string;
  title?: string;
  description: string;
  deadline?: string;
  sourceUrl: string;
  sourceUrls: string[];
  studentStatus: string[];
  studentType: string[];
  faculty?: string;
  fieldsOfStudy: string[];
  gender?: string;
  financialNeed: boolean;
  academicMerit: boolean;
  minimumGPA?: number;
  citizenship?: string;
  residency?: string;
  enrollmentStatus?: string;
  otherRequirements: string[];
  amount?: string;
  amountMin?: number;
  amountMax?: number;
  amountCurrency: string;
  tags: string[];
}

interface ScholarshipScrapeFormProps {
  onSuccess: (scholarshipId: string) => void;
  onCancel: () => void;
}

const STUDENT_STATUS_OPTIONS = ['IN_COURSE', 'GRADUATING', 'ENTERING'];
const STUDENT_TYPE_OPTIONS = ['DOMESTIC', 'INTERNATIONAL'];
const GENDER_OPTIONS = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'];

export default function ScholarshipScrapeForm({ onSuccess, onCancel }: ScholarshipScrapeFormProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [formData, setFormData] = useState<ScrapedData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUrl = () => {
    if (currentUrl.trim()) {
      setUrls([...urls, currentUrl.trim()]);
      setCurrentUrl('');
    }
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleScrape = async () => {
    const validUrls = urls.filter(url => url.trim().length > 0);
    
    if (validUrls.length === 0) {
      setError('Please add at least one URL');
      return;
    }

    setIsScraping(true);
    setError(null);

    try {
      // Step 1: Fetch HTML from URLs
      const fetchResponse = await fetch('/api/scholarships/fetch-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch HTML content');
      }

      const { htmlContent, results } = await fetchResponse.json();
      
      // Check if any URLs failed
      const failedUrls = results.filter((r: any) => !r.success);
      if (failedUrls.length > 0) {
        console.warn('Some URLs failed to fetch:', failedUrls);
      }

      // Step 2: Extract structured data using AI
      const scrapeResponse = await fetch('/api/scholarships/scrape-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls, htmlContent }),
      });

      if (!scrapeResponse.ok) {
        const errorData = await scrapeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract scholarship data');
      }

      const { data } = await scrapeResponse.json();
      setScrapedData(data);
      setFormData(data);
    } catch (err) {
      console.error('Scraping error:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape scholarship');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/scholarships/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create scholarship');
      }

      const { scholarshipId } = await response.json();
      onSuccess(scholarshipId);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scholarship');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormField = (field: keyof ScrapedData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const addArrayItem = (field: keyof ScrapedData, item: string) => {
    if (!formData) return;
    const current = (formData[field] as string[]) || [];
    if (item.trim() && !current.includes(item.trim())) {
      updateFormField(field, [...current, item.trim()]);
    }
  };

  const removeArrayItem = (field: keyof ScrapedData, index: number) => {
    if (!formData) return;
    const current = (formData[field] as string[]) || [];
    updateFormField(field, current.filter((_, i) => i !== index));
  };

  if (formData) {
    // Show form for editing scraped data
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review & Edit Scholarship Details</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Scholarship Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Deadline</label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => updateFormField('deadline', e.target.value || undefined)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum GPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                value={formData.minimumGPA || ''}
                onChange={(e) => updateFormField('minimumGPA', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Matching Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Student Status</label>
            <div className="flex flex-wrap gap-2">
              {STUDENT_STATUS_OPTIONS.map(status => (
                <label key={status} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.studentStatus.includes(status)}
                    onChange={(e) => {
                      const current = formData.studentStatus;
                      if (e.target.checked) {
                        updateFormField('studentStatus', [...current, status]);
                      } else {
                        updateFormField('studentStatus', current.filter(s => s !== status));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Student Type</label>
            <div className="flex flex-wrap gap-2">
              {STUDENT_TYPE_OPTIONS.map(type => (
                <label key={type} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.studentType.includes(type)}
                    onChange={(e) => {
                      const current = formData.studentType;
                      if (e.target.checked) {
                        updateFormField('studentType', [...current, type]);
                      } else {
                        updateFormField('studentType', current.filter(t => t !== type));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Fields of Study</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.fieldsOfStudy.map((field, index) => (
                <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm flex items-center gap-2 border border-emerald-200">
                  {field}
                  <button
                    onClick={() => removeArrayItem('fieldsOfStudy', index)}
                    className="hover:text-emerald-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add field of study"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('fieldsOfStudy', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          {/* Requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={formData.financialNeed}
                onChange={(e) => updateFormField('financialNeed', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Financial Need Required</span>
            </label>

            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={formData.academicMerit}
                onChange={(e) => updateFormField('academicMerit', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Academic Merit Based</span>
            </label>
          </div>

          {/* Amount */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Amount (Display)</label>
              <input
                type="text"
                value={formData.amount || ''}
                onChange={(e) => updateFormField('amount', e.target.value || undefined)}
                placeholder="$5,000"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Min Amount</label>
              <input
                type="number"
                value={formData.amountMin || ''}
                onChange={(e) => updateFormField('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Amount</label>
              <input
                type="number"
                value={formData.amountMax || ''}
                onChange={(e) => updateFormField('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name || !formData.description}
              className="flex-1 px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  That&apos;s All - Create Scholarship
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show URL input form
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add New Scholarship</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Paste scholarship URLs below. Some scholarships may span multiple pages - add all relevant URLs.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                const newUrls = [...urls];
                newUrls[index] = e.target.value;
                setUrls(newUrls);
              }}
              placeholder="https://example.com/scholarship-details"
              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
            />
            {urls.length > 1 && (
              <button
                onClick={() => removeUrl(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="url"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="Add another URL..."
          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
        />
        <button
          onClick={addUrl}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add URL
        </button>
      </div>

      <button
        onClick={handleScrape}
        disabled={isScraping || urls.filter(u => u.trim()).length === 0}
        className="w-full px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isScraping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Scraping and analyzing...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            Scrape & Extract Details
          </>
        )}
      </button>
    </div>
  );
}

