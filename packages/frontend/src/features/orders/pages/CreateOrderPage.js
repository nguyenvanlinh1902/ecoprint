import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap';
import OrderForm from '../components/OrderForm';

const CreateOrderPage = () => {
  return (
    <Container fluid className="p-4">
      <Helmet>
        <title>Create New Order | B2B Manager</title>
      </Helmet>
      <OrderForm isEditing={false} />
    </Container>
  );
};

export default CreateOrderPage; 