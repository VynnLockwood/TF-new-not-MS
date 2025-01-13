import React from 'react';
import Navbar from './Navbar'; // Adjust the path based on your file structure
import { UserProvider } from '@/context/UserContext'; // Import your context provider

const Layout = ({ children }) => {
  return (
    <UserProvider> {/* Wrap the entire Layout with UserProvider */}
      <>
        <Navbar />
        <main>{children}</main>
      </>
    </UserProvider>
  );
};

export default Layout;
