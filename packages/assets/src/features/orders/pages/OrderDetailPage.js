import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaArrowLeft, FaFileInvoice, FaTruck, FaEnvelope } from 'react-icons/fa';
import useOrders from '../hooks/useOrders';
import { useTranslation } from '../../../hooks';
import Loader from '../../../components/common/Loader';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, deleteOrder, loading, error } = useOrders();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      }
    };
    
    fetchOrder();
  }, [orderId, getOrder]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(orderId);
      navigate('/orders');
    }
  };
  
  if (loading) {
    return <Loader size="lg" />;
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  if (!order) {
    return <div className="alert alert-warning">Order not found</div>;
  }
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  return (
    <div className="order-detail-page container">
      <Helmet>
        <title>{order ? `${t('orders.orderNumber')} #${order.id}` : t('orders.details')} | B2B Manager</title>
      </Helmet>
      
      <div className="mb-4">
        <Link to="/orders" className="btn btn-outline-secondary btn-sm me-2">
          <FaArrowLeft className="me-1" />
          {t('common.back')}
        </Link>
      </div>
      
      <div className="order-status-bar">
        <div className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>
          {order.status || 'Pending'}
        </div>
        <div className="order-date">
          <span>Order Date:</span> {formatDate(order.createdAt)}
        </div>
      </div>
      
      <div className="order-content">
        <div className="order-info-panel">
          <div className="panel">
            <h3>Customer Information</h3>
            <div className="panel-content">
              <p><strong>Name:</strong> {order.customer?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {order.customer?.phone || 'N/A'}</p>
            </div>
          </div>
          
          <div className="panel">
            <h3>Shipping Address</h3>
            <div className="panel-content">
              <p>{order.shippingAddress?.line1 || 'N/A'}</p>
              {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress?.city || ''} 
                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} 
                {order.shippingAddress?.postalCode || ''}
              </p>
              <p>{order.shippingAddress?.country || ''}</p>
            </div>
          </div>
          
          <div className="panel">
            <h3>Payment Information</h3>
            <div className="panel-content">
              <p><strong>Method:</strong> {order.paymentMethod || 'N/A'}</p>
              <p><strong>Status:</strong> {order.paymentStatus || 'N/A'}</p>
              {order.paymentDate && (
                <p><strong>Payment Date:</strong> {formatDate(order.paymentDate)}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="order-items-panel">
          <div className="panel">
            <h3>Order Items</h3>
            <div className="panel-content">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="product-cell">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="product-thumbnail" />
                          )}
                          <div className="product-info">
                            <div className="product-name">{item.name}</div>
                            <div className="product-sku">SKU: {item.sku || 'N/A'}</div>
                          </div>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-items">No items in this order</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>-{formatCurrency(order.discount || 0)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="order-actions">
        <button className="btn btn-secondary">
          <FaFileInvoice /> Generate Invoice
        </button>
        <button className="btn btn-secondary">
          <FaTruck /> Update Shipping
        </button>
        <button className="btn btn-secondary">
          <FaEnvelope /> Email Customer
        </button>
      </div>
      
      {order.notes && (
        <div className="order-notes">
          <h3>Order Notes</h3>
          <div className="notes-content">
            {order.notes}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 