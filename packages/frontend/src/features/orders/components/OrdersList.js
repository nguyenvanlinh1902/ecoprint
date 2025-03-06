import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Badge, 
  Card, 
  Row, 
  Col, 
  Form, 
  InputGroup, 
  Pagination 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort, 
  faEye, 
  faEdit, 
  faTrash,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import useOrders from '../hooks/useOrders';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Status badge component
const StatusBadge = ({ status }) => {
  const getBadgeVariant = () => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Badge bg={getBadgeVariant()}>
      {status || 'Unknown'}
    </Badge>
  );
};

const OrdersList = () => {
  const { 
    orders, 
    loading, 
    error, 
    totalCount, 
    filters, 
    pagination,
    loadOrders, 
    updateFilters, 
    updatePagination, 
    clearFilters,
    removeOrder
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load orders on component mount and when filters/pagination change
  useEffect(() => {
    loadOrders();
  }, [loadOrders, filters, pagination]);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ searchTerm });
  };

  // Apply status filter
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    updateFilters({ status: status || null });
  };

  // Handle sorting
  const handleSort = (field) => {
    const currentSort = filters.sort || 'createdAt:desc';
    const [currentField, currentDirection] = currentSort.split(':');
    
    const newDirection = (currentField === field && currentDirection === 'asc') ? 'desc' : 'asc';
    updateFilters({ sort: `${field}:${newDirection}` });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    updatePagination({ page });
  };

  // Handle delete
  const handleDelete = async (orderId) => {
    if (confirmDelete === orderId) {
      try {
        await removeOrder(orderId);
        setConfirmDelete(null);
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    } else {
      setConfirmDelete(orderId);
    }
  };

  // Reset delete confirmation when orders change
  useEffect(() => {
    setConfirmDelete(null);
  }, [orders]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pagination.limit);

  return (
    <div className="orders-list">
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Orders Management</h5>
          <Link to="/orders/new">
            <Button variant="primary" size="sm">
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              New Order
            </Button>
          </Link>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowFilters(!showFilters)}
                    active={showFilters}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={6} className="text-end">
              <span className="me-2">Total: {totalCount} orders</span>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearFilters}
                disabled={!filters.searchTerm && !filters.status && filters.sort === 'createdAt:desc'}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          {showFilters && (
            <Row className="mb-3">
              <Col>
                <Card className="filter-card">
                  <Card.Body>
                    <h6>Filter by Status:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      <Button 
                        variant={selectedStatus === '' ? 'primary' : 'outline-primary'} 
                        size="sm" 
                        onClick={() => handleStatusFilter('')}
                      >
                        All
                      </Button>
                      <Button 
                        variant={selectedStatus === 'pending' ? 'warning' : 'outline-warning'} 
                        size="sm" 
                        onClick={() => handleStatusFilter('pending')}
                      >
                        Pending
                      </Button>
                      <Button 
                        variant={selectedStatus === 'processing' ? 'primary' : 'outline-primary'} 
                        size="sm" 
                        onClick={() => handleStatusFilter('processing')}
                      >
                        Processing
                      </Button>
                      <Button 
                        variant={selectedStatus === 'completed' ? 'success' : 'outline-success'} 
                        size="sm" 
                        onClick={() => handleStatusFilter('completed')}
                      >
                        Completed
                      </Button>
                      <Button 
                        variant={selectedStatus === 'cancelled' ? 'danger' : 'outline-danger'} 
                        size="sm" 
                        onClick={() => handleStatusFilter('cancelled')}
                      >
                        Cancelled
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              Error: {error}
            </div>
          )}

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')} className="sortable">
                      Order ID <FontAwesomeIcon icon={faSort} size="xs" />
                    </th>
                    <th onClick={() => handleSort('customer')} className="sortable">
                      Customer <FontAwesomeIcon icon={faSort} size="xs" />
                    </th>
                    <th onClick={() => handleSort('totalAmount')} className="sortable">
                      Total <FontAwesomeIcon icon={faSort} size="xs" />
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable">
                      Status <FontAwesomeIcon icon={faSort} size="xs" />
                    </th>
                    <th onClick={() => handleSort('createdAt')} className="sortable">
                      Created At <FontAwesomeIcon icon={faSort} size="xs" />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer?.name || 'N/A'}</td>
                        <td>${order.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/orders/${order.id}`}>
                              <Button variant="outline-info" size="sm">
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </Link>
                            <Link to={`/orders/${order.id}/edit`}>
                              <Button variant="outline-primary" size="sm">
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                            </Link>
                            <Button 
                              variant={confirmDelete === order.id ? "danger" : "outline-danger"} 
                              size="sm"
                              onClick={() => handleDelete(order.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No orders found. {filters.searchTerm || filters.status ? (
                          <Button variant="link" onClick={clearFilters}>Clear filters</Button>
                        ) : null}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, totalCount)} to {Math.min(pagination.page * pagination.limit, totalCount)} of {totalCount} entries
                  </div>
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={pagination.page === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} />
                    
                    {[...Array(Math.min(5, totalPages)).keys()].map(i => {
                      // Logic to show current page and adjacent pages
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Pagination.Item 
                          key={pageNum} 
                          active={pageNum === pagination.page}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={pagination.page === totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrdersList; 