import React from 'react';
import { OrdersListPage, OrderDetailPage, CreateOrderPage, EditOrderPage } from './pages';

const OrdersRoutes = [
  {
    path: '/orders',
    element: <OrdersListPage />,
    exact: true,
  },
  {
    path: '/orders/new',
    element: <CreateOrderPage />,
    exact: true,
  },
  {
    path: '/orders/:orderId',
    element: <OrderDetailPage />,
    exact: true,
  },
  {
    path: '/orders/:orderId/edit',
    element: <EditOrderPage />,
    exact: true,
  },
];

export default OrdersRoutes; 