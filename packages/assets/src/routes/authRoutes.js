import React from 'react';
import { Route } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import PendingVerification from '../components/auth/PendingVerification';

const authRoutes = [
  {
    path: "/login",
    element: <Login />,
    exact: true,
  },
  {
    path: "/register",
    element: <Register />,
    exact: true,
  },
  {
    path: "/pending-verification",
    element: <PendingVerification />,
    exact: true,
  },
];

export default authRoutes; 