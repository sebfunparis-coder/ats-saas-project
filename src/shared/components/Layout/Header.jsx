/**
 * 📋 Header Component
 *
 * Header de l'application
 */

import React, { useState } from 'react';
import { useAuth, useUI } from '@/core/contexts';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useUI();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Breadcrumbs or page title */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {/* Dynamic page title will go here */}
        </h2>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          title="Notifications"
        >
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/app/admin');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ⚙️ Paramètres
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Open profile modal
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  👤 Mon profil
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  🚪 Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
