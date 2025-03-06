import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaArrowLeft, FaFileInvoice, FaTruck, FaEnvelope } from 'react-icons/fa';
import useOrders from '../hooks/useOrders';
import { useTranslation } from '../../../features/languages/hooks';
import Loader from '../../../components/common/Loader';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { order, loading, error, getOrder, removeOrder } = useOrders();
  const { t } = useTranslation();

  useEffect(() => {
    getOrder(orderId);
  }, [orderId, getOrder]);

  const handleDelete = async () => {
    if (window.confirm(t('orders.deleteConfirm', { orderNumber: orderId }))) {
      try {
        await removeOrder(orderId);
        navigate('/don-hang');
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${Number(amount).toLocaleString()} VND`;
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let className = 'badge';
    
    switch (status?.toLowerCase()) {
      case 'completed':
        className += ' badge--success';
        break;
      case 'processing':
        className += ' badge--primary';
        break;
      case 'pending':
        className += ' badge--warning';
        break;
      case 'cancelled':
        className += ' badge--danger';
        break;
      default:
        className += ' badge--secondary';
    }
    
    return <span className={className}>{status || 'Unknown'}</span>;
  };
  
  // Render payment status badge
  const renderPaymentStatusBadge = (status) => {
    let className = 'badge';
    
    switch (status?.toLowerCase()) {
      case 'paid':
        className += ' badge--success';
        break;
      case 'pending':
        className += ' badge--warning';
        break;
      case 'refunded':
        className += ' badge--info';
        break;
      case 'failed':
        className += ' badge--danger';
        break;
      default:
        className += ' badge--secondary';
    }
    
    return <span className={className}>{status || 'Unknown'}</span>;
  };

  return (
    <div className="order-detail-page container">
      <Helmet>
        <title>{order ? `${t('orders.orderNumber')} #${order.id}` : t('orders.details')} | B2B Manager</title>
      </Helmet>
      
      <div className="mb-4">
        <Link to="/don-hang" className="btn btn-outline-secondary btn-sm me-2">
          <FaArrowLeft className="me-1" />
          {t('common.back')}
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center p-5">
          <Loader />
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          {t('common.error')}: {error}
        </div>
      ) : !order ? (
        <div className="alert alert-warning">
          {t('orders.noOrdersFound')}
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{t('orders.orderNumber')} #{order.id}</h5>
              <div>
                <Link 
                  to={`/don-hang/${order.id}/edit`}
                  className="btn btn-outline-primary btn-sm me-2"
                >
                  <FaEdit className="me-1" />
                  {t('common.edit')}
                </Link>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDelete}
                >
                  <FaTrash className="me-1" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h6 className="mb-3">{t('orders.orderInfo')}</h6>
                  <table className="table table-borderless table-sm mb-4">
                    <tbody>
                      <tr>
                        <td width="180"><strong>{t('orders.orderNumber')}:</strong></td>
                        <td>{order.id}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('orders.createdAt')}:</strong></td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('orders.updatedAt')}:</strong></td>
                        <td>{formatDate(order.updatedAt)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('orders.status')}:</strong></td>
                        <td>{renderStatusBadge(order.status)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('orders.paymentStatus')}:</strong></td>
                        <td>{renderPaymentStatusBadge(order.paymentStatus)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('orders.paymentMethod')}:</strong></td>
                        <td>{order.paymentMethod?.replace('_', ' ')}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h6 className="mb-3">{t('orders.customerInfo')}</h6>
                  <table className="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td width="180"><strong>{t('profile.name')}:</strong></td>
                        <td>{order.customer?.name}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('common.email')}:</strong></td>
                        <td>{order.customer?.email}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('profile.phone')}:</strong></td>
                        <td>{order.customer?.phone}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('profile.address')}:</strong></td>
                        <td>{order.customer?.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h6 className="mb-3">{t('orders.orderSummary')}</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{t('orders.items')}:</span>
                        <span>{order.items?.length || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{t('orders.quantity')}:</span>
                        <span>
                          {order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>{t('orders.grandTotal')}:</span>
                        <span>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="mb-3">{t('common.actions')}</h6>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary btn-sm">
                        <FaFileInvoice className="me-1" />
                        {t('orders.printInvoice')}
                      </button>
                      <button className="btn btn-outline-success btn-sm">
                        <FaTruck className="me-1" />
                        {t('orders.trackOrder')}
                      </button>
                      <button className="btn btn-outline-info btn-sm">
                        <FaEnvelope className="me-1" />
                        {t('orders.sendInvoice')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <h6 className="mt-4 mb-3">{t('orders.orderItems')}</h6>
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>{t('orders.productName')}</th>
                      <th className="text-center" width="100">{t('orders.quantity')}</th>
                      <th className="text-end" width="140">{t('orders.price')}</th>
                      <th className="text-end" width="160">{t('orders.subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  width="40" 
                                  height="40" 
                                  className="me-2"
                                  style={{ objectFit: 'cover' }} 
                                />
                              )}
                              <div>
                                <div>{item.name}</div>
                                {item.sku && <small className="text-muted">SKU: {item.sku}</small>}
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatCurrency(item.price)}</td>
                          <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-3">
                          {t('orders.emptyOrder')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end">
                        <strong>{t('orders.subtotal')}:</strong>
                      </td>
                      <td className="text-end">
                        {formatCurrency(
                          order.items?.reduce(
                            (sum, item) => sum + (item.price * (item.quantity || 1)),
                            0
                          ) || 0
                        )}
                      </td>
                    </tr>
                    {order.discount > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>{t('orders.discount')}:</strong>
                        </td>
                        <td className="text-end">-{formatCurrency(order.discount)}</td>
                      </tr>
                    )}
                    {order.tax > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>{t('orders.tax')}:</strong>
                        </td>
                        <td className="text-end">{formatCurrency(order.tax)}</td>
                      </tr>
                    )}
                    {order.shipping > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>{t('orders.shipping')}:</strong>
                        </td>
                        <td className="text-end">{formatCurrency(order.shipping)}</td>
                      </tr>
                    )}
                    <tr className="table-active">
                      <td colSpan="3" className="text-end">
                        <strong>{t('orders.grandTotal')}:</strong>
                      </td>
                      <td className="text-end fw-bold">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {order.notes && (
                <div className="mt-4">
                  <h6 className="mb-2">{t('orders.notes')}:</h6>
                  <div className="p-3 bg-light rounded">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailPage; 