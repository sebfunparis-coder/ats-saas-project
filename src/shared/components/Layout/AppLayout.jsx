/**
 * 🏗️ AppLayout Component
 *
 * Layout principal de l'application avec sidebar et header
 */

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUI } from '@/core/contexts';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 */
export const AppLayout = ({ children }) => {
  const { sidebarCollapsed } = useUI();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
