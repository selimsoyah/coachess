'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBasicAuth = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const testEmail = email || `test-${Date.now()}@example.com`;
      console.log('Testing signup with:', testEmail);
      
      const startTime = Date.now();
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: password || 'test123456',
      });
      const endTime = Date.now();
      
      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult(`✅ Success in ${endTime - startTime}ms!\nUser ID: ${data.user?.id}\nSession: ${data.session ? 'Yes' : 'No'}`);
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-4 bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold">Test Supabase Auth</h1>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Leave blank for random"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="test123456"
          />
        </div>
        
        <button
          onClick={testBasicAuth}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Auth Signup'}
        </button>
        
        {result && (
          <pre className="p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap">
            {result}
          </pre>
        )}
        
        <div className="text-xs text-gray-500">
          <p>This tests ONLY Supabase auth.signUp()</p>
          <p>No custom logic, no profile creation</p>
        </div>
      </div>
    </div>
  );
}
