import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.js';
import Footer from '../components/Footer.js';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <Header />
      <main className="flex-1 container-custom py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
