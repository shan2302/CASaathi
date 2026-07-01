import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
