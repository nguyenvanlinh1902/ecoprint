import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap';
import OrdersList from '../components/OrdersList';

const OrdersListPage = () => {
  return (
    <Container fluid className="p-4">
      <Helmet>
        <title>Orders | B2B Manager</title>
      </Helmet>
      <OrdersList />
    </Container>
  );
};

export default OrdersListPage; 