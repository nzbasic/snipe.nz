import { Outlet } from 'react-router-dom';
import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center text-white">
    <div className="max-w-6xl w-full flex flex-col">
      <Header />
      <div className="main-container bg-light rounded-t-md">
        <Outlet />
      </div>
      <Footer />
    </div>
  </div>
);

export default Layout;
