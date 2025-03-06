import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap';
import OrderForm from '../components/OrderForm';

const EditOrderPage = () => {
  return (
    <Container fluid className="p-4">
      <Helmet>
        <title>Edit Order | B2B Manager</title>
      </Helmet>
      <OrderForm isEditing={true} />
    </Container>
  );
};

export default EditOrderPage; 