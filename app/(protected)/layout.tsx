import Navbar from '@/components/Navbar';
import React from 'react';

const InternalLayout = ({children}:Readonly<{children:React.ReactNode}>) => {
  return (
    <div>
      <Navbar />
      {children}  
    </div>
  );
}

export default InternalLayout;
