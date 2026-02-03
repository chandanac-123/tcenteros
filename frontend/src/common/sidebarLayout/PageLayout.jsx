import React from 'react';

const Sidebar = ({ children }) => (
  <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
    {/* Sidebar content here (e.g., nav links) */}
    <div className="font-bold text-lg mb-6">Sidebar</div>
    {/* ...add your navigation here... */}
    {children}
  </aside>
);

const Header = () => (
  <header className="w-full bg-white shadow flex items-center h-16 px-6">
    {/* Header content here (e.g., logo, user menu) */}
    <div className="font-bold text-xl">Header</div>
    {/* ...add your header content here... */}
  </header>
);

const PageLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  </div>
);

export default PageLayout;
