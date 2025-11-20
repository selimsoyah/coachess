'use client';

import { useState } from 'react';

export default function RawTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRawFetch = async () => {
    setLoading(true);
    setResult('Testing raw fetch...');
    
    try {
      const email = `test-${Date.now()}@example.com`;
      console.log('Making raw fetch to:', email);
      
      const startTime = Date.now();
      
      const response = await fetch('https://egbetefiwmefsoynyemz.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYmV0ZWZpd21lZnNveW55ZW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzA0NjMsImV4cCI6MjA3NjkwNjQ2M30.o5GSzvT5nK9lQ91YxiWb_5r2ShUnEyCc0DT-g07FWIU',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: 'test123456'
        })
      });
      
      const endTime = Date.now();
      const data = await response.json();
      
      console.log('Response:', data);
      
      if (response.ok) {
        setResult(`✅ Success in ${endTime - startTime}ms!\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.error_description || data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setResult(`❌ Exception: ${err.message}\n${err.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-4 bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold">Test RAW Fetch (No Supabase Client)</h1>
        
        <button
          onClick={testRawFetch}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Raw Fetch'}
        </button>
        
        {result && (
          <pre className="p-4 bg-gray-100 rounded text-xs whitespace-pre-wrap overflow-auto max-h-96">
            {result}
          </pre>
        )}
        
        <div className="text-xs text-gray-500">
          <p>This bypasses the Supabase client completely</p>
          <p>Uses plain fetch() to hit the Supabase API directly</p>
        </div>
      </div>
    </div>
  );
}
