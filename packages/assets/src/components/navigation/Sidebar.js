import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUsers, 
  FaUsersCog, 
  FaCog, 
  FaClipboardList 
} from 'react-icons/fa';
import './Sidebar.scss';

const Sidebar = ({ isOpen }) => {
  const { role } = useSelector(state => state.auth);
  const isAdmin = role === 'admin';

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <FaChartLine />
    },
    {
      label: 'Products',
      path: '/products',
      icon: <FaBoxOpen />
    },
    {
      label: 'Orders',
      path: '/orders',
      icon: <FaShoppingCart />
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: <FaUsers />
    }
  ];

  const adminNavItems = [
    {
      label: 'User Management',
      path: '/admin/users',
      icon: <FaUsersCog />
    },
    {
      label: 'System Settings',
      path: '/admin/settings',
      icon: <FaCog />
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      icon: <FaClipboardList />
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <nav className="sidebar__nav">
        <div className="sidebar__section">
          <h3 className="sidebar__heading">Main</h3>
          {navItems.map((item, index) => (
            <Link key={index} to={item.path} className="sidebar__item">
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="sidebar__section">
            <h3 className="sidebar__heading">Admin</h3>
            {adminNavItems.map((item, index) => (
              <Link key={index} to={item.path} className="sidebar__item">
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__label">{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar__footer">
        <p>EcoPrint Admin v1.0</p>
      </div>
    </aside>
  );
};

export default Sidebar; 