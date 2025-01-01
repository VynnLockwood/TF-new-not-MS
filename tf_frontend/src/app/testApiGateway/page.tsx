"use client"

import { useEffect, useState } from 'react';

const TestAPI = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        console.log('Fetching from URL:', `${process.env.NEXT_PUBLIC_API_URL}/test`);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test`);
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error fetching API:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      {message ? <h1>{message}</h1> : <p>Loading...</p>}
    </div>
  );
};

export default TestAPI;
