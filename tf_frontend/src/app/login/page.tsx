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
      window.open('http://localhost:5000/auth/login');
    } catch (err) {
      setError('An error occurred while trying to log in.');
      setLoading(false);
    }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
  <div className="relative w-full max-w-md bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-lg">
    <div className="flex justify-center mb-6">
      <img src="https://i.postimg.cc/sX2ntz2w/Wok-Asian-Food-Logo.png" alt="Thai Foods Logo" className="w-36  sm:h-auto" />
    </div>
    <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4">Welcome</h1>
    <p className="text-sm sm:text-base text-center text-gray-600 mb-6">
      Sign in to continue
    </p>
    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
    <div className="space-y-4">
      <input
        type="email"
        placeholder="E-mail"
        className="w-full px-4 py-2 sm:py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 sm:py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleLoginClick}
        className={`w-full py-2 sm:py-3 px-6 text-white font-medium rounded-lg shadow-md transition duration-300 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
    <div className="flex items-center my-4">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="mx-4 text-gray-400">or</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
    <div className="space-y-4">
      <button
        onClick={handleLoginClick}
        className={`flex items-center justify-center w-full py-2 sm:py-3 px-6 text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${
          loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="text-gray-400">Logging in...</span>
        ) : (
          <>
            <img
              src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
              alt="Google Logo"
              className="h-5 w-5 mr-2"
            />
            <span className="font-medium">Log in with Google</span>
          </>
        )}
      </button>
    </div>
  </div>
</div>

   
    </>
  );
};

export default LoginPage;
