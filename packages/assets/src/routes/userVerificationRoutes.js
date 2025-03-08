import React from 'react';
import { Route } from 'react-router-dom';
import UserVerification from '../components/admin/UserVerification';

const userVerificationRoutes = [
  {
    path: "/admin/user-verification",
    element: <UserVerification />,
    exact: true,
  },
];

export default userVerificationRoutes; 