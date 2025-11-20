'use client';

import { useState } from 'react';
import ContentEditor, { ContentData } from '@/components/chess/ContentEditor';

export default function ContentEditorDemoPage() {
  const [savedContent, setSavedContent] = useState<ContentData | null>(null);
  const [showEditor, setShowEditor] = useState(true);

  const handleSave = (data: ContentData) => {
    console.log('Content saved:', data);
    setSavedContent(data);
    setShowEditor(false);
  };

  const handleCancel = () => {
    console.log('Editor cancelled');
    setShowEditor(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Editor Demo</h1>
          <p className="text-gray-600">Create chess lessons (PGN) or puzzles (FEN)</p>
        </div>

        {showEditor ? (
          <div className="bg-white p-8 rounded-lg shadow">
            <ContentEditor
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-green-900">Content Saved Successfully!</h2>
              </div>
              
              {savedContent && (
                <div className="bg-white p-4 rounded border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Saved Content:</h3>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(savedContent, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowEditor(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
