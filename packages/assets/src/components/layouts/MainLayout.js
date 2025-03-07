import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../navigation/Header';
import Sidebar from '../navigation/Sidebar';
import './MainLayout.scss';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`main-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Header toggleSidebar={toggleSidebar} />
      <div className="main-layout__container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 