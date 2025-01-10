import React from 'react';
import Navbar from './Navbar'; // Adjust the path based on your file structure

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
