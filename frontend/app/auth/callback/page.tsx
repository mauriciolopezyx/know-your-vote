'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const handleCallback = async () => {
      const logs: string[] = [];
      
      try {
        // Log the full URL for debugging
        logs.push(`Full URL: ${window.location.href}`);
        logs.push(`Hash: ${window.location.hash}`);
        logs.push(`Search: ${window.location.search}`);
        
        // Check if we have a hash in the URL (implicit flow - tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // Check if we have a code in the query (PKCE flow - code in query params)
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const errorParam = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');

        logs.push(`Access token present: ${!!accessToken}`);
        logs.push(`Refresh token present: ${!!refreshToken}`);
        logs.push(`Code present: ${!!code}`);
        logs.push(`Error param: ${errorParam}`);
        
        setDebugInfo(logs);
        console.log('Debug logs:', logs);

        // Handle errors from OAuth provider
        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setTimeout(() => router.push('/login?error=oauth-failed'), 3000);
          return;
        }

        // Handle implicit flow (tokens in hash)
        if (accessToken && refreshToken) {
          logs.push('Attempting to set session from hash tokens');
          setDebugInfo([...logs]);
          
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            logs.push(`Session error: ${sessionError.message}`);
            setDebugInfo([...logs]);
            console.error('Session error:', sessionError);
            setError(sessionError.message);
            setTimeout(() => router.push('/login?error=session-failed'), 3000);
            return;
          }

          if (data?.user) {
            logs.push(`User authenticated: ${data.user.id}`);
            setDebugInfo([...logs]);
            console.log('User authenticated:', data.user.id);
            
            // Create or update profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: data.user.id,
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );

            if (profileError) {
              console.log('Profile error:', profileError);
              logs.push(`Profile error: ${profileError.message}`);
              setDebugInfo([...logs]);
            }

            logs.push('Redirecting to home...');
            setDebugInfo([...logs]);
            
            // Redirect to home page
            setTimeout(() => router.push('/'), 500);
            return;
          } else {
            logs.push('Session set but no user data received');
            setDebugInfo([...logs]);
          }
        }

        // Handle PKCE flow (code in query params)
        if (code) {
          logs.push('Attempting to exchange code for session');
          setDebugInfo([...logs]);
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            logs.push(`Code exchange error: ${exchangeError.message}`);
            setDebugInfo([...logs]);
            console.error('Code exchange error:', exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push('/login?error=exchange-failed'), 3000);
            return;
          }

          if (data?.user) {
            logs.push(`User authenticated: ${data.user.id}`);
            setDebugInfo([...logs]);
            console.log('User authenticated:', data.user.id);
            
            // Create or update profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(
                {
                  id: data.user.id,
                  email: data.user.email,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );

            if (profileError) {
              console.error('Profile error:', profileError);
              logs.push(`Profile error: ${profileError.message}`);
              setDebugInfo([...logs]);
            }

            logs.push('Redirecting to home...');
            setDebugInfo([...logs]);
            
            // Redirect to home page
            setTimeout(() => router.push('/'), 500);
            return;
          }
        }

        // If we get here, something went wrong
        logs.push('No valid authentication data found in URL');
        setDebugInfo([...logs]);
        console.error('No valid authentication data found');
        setError('No authentication data received');
        setTimeout(() => router.push('/login?error=no-auth-data'), 3000);

      } catch (err) {
        logs.push(`Exception: ${err instanceof Error ? err.message : String(err)}`);
        setDebugInfo([...logs]);
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setTimeout(() => router.push('/login?error=callback-failed'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-4">
        <div className="text-center">
          {error ? (
            <div className="space-y-2">
              <div className="text-red-500 text-lg font-semibold">Authentication Error</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <div className="text-sm text-muted-foreground">Redirecting to login...</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-semibold">Completing sign in...</div>
              <div className="text-sm text-muted-foreground">Please wait</div>
            </div>
          )}
        </div>
        
        {/* Debug info */}
        {debugInfo.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs font-mono overflow-auto max-h-96">
            <div className="font-semibold mb-2">Debug Information:</div>
            {debugInfo.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}