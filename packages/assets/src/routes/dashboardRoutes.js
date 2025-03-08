import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';

const dashboardRoutes = [
  {
    path: "/dashboard/*",
    element: <Dashboard />,
    exact: false,
  },
];

export default dashboardRoutes; 