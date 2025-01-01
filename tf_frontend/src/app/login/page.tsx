'use client'; // Mark the file as client-side

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for session in localStorage
    const user = localStorage.getItem('user');
    if (user) {
      // Redirect to the dashboard if session exists
      router.push('/dashboard');
    }
  }, [router]);

  const handleLoginClick = async () => {
    try {
      setLoading(true);
      // Open the Flask backend login route in a new tab
      window.open('http://localhost:5000/login', '_blank');
    } catch (err) {
      setError('An error occurred while trying to log in.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      <h1 className="text-4xl font-semibold text-gray-800 mb-4">Welcome to Thai Food Recipes</h1>
      <p className="text-lg text-gray-600 mb-6">Please log in to access the full app.</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleLoginClick}
        className={`w-full max-w-xs py-3 px-6 text-white font-medium rounded-md shadow-lg focus:outline-none transition duration-300 ease-in-out ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log in with Google'}
      </button>
    </div>
  );
};

export default LoginPage;
