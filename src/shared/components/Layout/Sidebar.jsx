/**
 * 📌 Sidebar Component
 *
 * Sidebar de navigation de l'application
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, useUI } from '@/core/contexts';
import { NAV_ITEMS, getNavItemsByRole } from '@/config/routes';

export const Sidebar = () => {
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const location = useLocation();

  const navItems = user ? getNavItemsByRole(user.role) : [];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-blue-600">ATS Ultimate</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={sidebarCollapsed ? 'Développer' : 'Réduire'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info (bottom) */}
      {user && !sidebarCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
