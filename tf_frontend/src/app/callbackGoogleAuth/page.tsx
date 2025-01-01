'use client'; // For client-side rendering

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CallbackHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log("Callback handler started.");

      try {
        // Step 1: Verify the session by calling the backend API
        const sessionCheckResponse = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include',  // Include cookies with the request
        });

        // Check if the session is valid
        if (!sessionCheckResponse.ok) {
          throw new Error(`Session check failed with status: ${sessionCheckResponse.status}`);
        }

        const sessionData = await sessionCheckResponse.json();
        console.log('Session verified:', sessionData);

        if (sessionData.valid) {
          // Step 2: Redirect to the dashboard if session is valid
          router.push('/dashboard');
        } else {
          // If the session is invalid, redirect to login with an error
          router.push('/login?error=invalid_session');
        }
      } catch (error) {
        // Enhanced error logging for debugging
        console.error('Error handling callback:', error);
      
        
        // Redirect to login page with a more detailed error message
        router.push(`/login?error=server_error`);
      }
    };

    handleCallback();
  }, [router]);

  return <div>Processing login, please wait...</div>;
};

export default CallbackHandler;
