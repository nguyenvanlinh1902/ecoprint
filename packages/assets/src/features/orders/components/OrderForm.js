import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FaSave, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaArrowLeft 
} from 'react-icons/fa';
import useOrders from '../hooks/useOrders';
import { useTranslation } from '../../../hooks';
import Loader from '../../../components/common/Loader';

const OrderForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { 
    order, 
    loading, 
    error, 
    getOrder, 
    addOrder, 
    editOrder, 
    clearOrder 
  } = useOrders();
  const { t } = useTranslation();

  // Default empty order
  const emptyOrder = {
    customer: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    items: [{
      productId: '',
      name: '',
      quantity: 1,
      price: 0,
      subtotal: 0
    }],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    totalAmount: 0,
    notes: '',
  };

  // Form state
  const [formData, setFormData] = useState(emptyOrder);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Load order data if in edit mode
  useEffect(() => {
    if (isEditing && orderId) {
      getOrder(orderId);
    } else {
      clearOrder();
    }
    
    return () => clearOrder();
  }, [isEditing, orderId, getOrder, clearOrder]);

  // Update form when order data is loaded
  useEffect(() => {
    if (isEditing && order) {
      setFormData(order);
    }
  }, [isEditing, order]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle order item changes
  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      // Calculate item total price
      if (field === 'quantity' || field === 'price') {
        const price = field === 'price' ? value : updatedItems[index].price;
        const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
        
        updatedItems[index].subtotal = Number(price) * Number(quantity);
      }

      // Calculate order total
      const updatedOrder = {
        ...prev,
        items: updatedItems,
        totalAmount: calculateOrderTotal(updatedItems)
      };

      return updatedOrder;
    });
  };

  // Calculate order total from items
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return total + itemTotal;
    }, 0);
  };

  // Add new item to order
  const addItem = () => {
    setFormData(prev => {
      const newItem = {
        productId: '',
        name: '',
        quantity: 1,
        price: 0,
        subtotal: 0
      };

      const updatedItems = [...prev.items, newItem];
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount: calculateOrderTotal(updatedItems)
      };
    });
  };

  // Remove item from order
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      return; // Don't remove the last item
    }

    setFormData(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount: calculateOrderTotal(updatedItems)
      };
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Validate customer info
    if (!formData.customer.name) {
      errors['customer.name'] = 'Customer name is required';
    }
    
    if (!formData.customer.email) {
      errors['customer.email'] = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) {
      errors['customer.email'] = 'Please enter a valid email address';
    }
    
    if (!formData.customer.phone) {
      errors['customer.phone'] = 'Customer phone is required';
    }
    
    if (!formData.customer.address) {
      errors['customer.address'] = 'Customer address is required';
    }

    // Validate order items
    formData.items.forEach((item, index) => {
      if (!item.name) {
        errors[`items[${index}].name`] = 'Product name is required';
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
      }
      
      if (!item.price || item.price <= 0) {
        errors[`items[${index}].price`] = 'Price must be greater than 0';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      if (isEditing) {
        await editOrder(orderId, formData);
        setShowSuccessAlert(true);
        
        // Scroll to top to show the success message
        window.scrollTo(0, 0);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 3000);
      } else {
        const result = await addOrder(formData);
        
        if (result && result.id) {
          navigate(`/don-hang/${result.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return `${Number(amount).toLocaleString()} VND`;
  };
  
  // Get field error
  const getFieldError = (fieldName) => {
    return formErrors[fieldName] || null;
  };

  return (
    <div className="order-form">
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{isEditing ? t('orders.editOrder') : t('orders.createOrder')}</h5>
          <Link 
            to="/don-hang" 
            className="btn btn-outline-secondary btn-sm"
          >
            <FaArrowLeft className="me-1" />
            {t('common.back')}
          </Link>
        </div>
        <div className="card-body">
          {loading && !formSubmitting ? (
            <div className="text-center p-5">
              <Loader />
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              {t('common.error')}: {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {showSuccessAlert && (
                <div className="alert alert-success alert-dismissible fade show">
                  {t('orders.successUpdate')}
                  <button type="button" className="btn-close" onClick={() => setShowSuccessAlert(false)}></button>
                </div>
              )}

              <h6 className="mb-3">{t('orders.customerInfo')}</h6>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('profile.name')}*</label>
                    <input 
                      type="text" 
                      name="customer.name" 
                      value={formData.customer.name || ''} 
                      onChange={handleChange} 
                      className={`form-control ${getFieldError('customer.name') ? 'is-invalid' : ''}`}
                    />
                    {getFieldError('customer.name') && (
                      <div className="invalid-feedback">
                        {getFieldError('customer.name')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('common.email')}*</label>
                    <input 
                      type="email" 
                      name="customer.email" 
                      value={formData.customer.email || ''} 
                      onChange={handleChange} 
                      className={`form-control ${getFieldError('customer.email') ? 'is-invalid' : ''}`}
                    />
                    {getFieldError('customer.email') && (
                      <div className="invalid-feedback">
                        {getFieldError('customer.email')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('profile.phone')}*</label>
                    <input 
                      type="tel" 
                      name="customer.phone" 
                      value={formData.customer.phone || ''} 
                      onChange={handleChange} 
                      className={`form-control ${getFieldError('customer.phone') ? 'is-invalid' : ''}`}
                    />
                    {getFieldError('customer.phone') && (
                      <div className="invalid-feedback">
                        {getFieldError('customer.phone')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('profile.address')}*</label>
                    <input 
                      type="text" 
                      name="customer.address" 
                      value={formData.customer.address || ''} 
                      onChange={handleChange} 
                      className={`form-control ${getFieldError('customer.address') ? 'is-invalid' : ''}`}
                    />
                    {getFieldError('customer.address') && (
                      <div className="invalid-feedback">
                        {getFieldError('customer.address')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">{t('orders.orderItems')}</h6>
              </div>

              {formData.items.map((item, index) => (
                <div className="row mb-3" key={index}>
                  <div className="col-md-5">
                    <div className="mb-3">
                      <label className="form-label">{t('orders.productName')}*</label>
                      <input 
                        type="text" 
                        value={item.name || ''} 
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className={`form-control ${getFieldError(`items[${index}].name`) ? 'is-invalid' : ''}`}
                      />
                      {getFieldError(`items[${index}].name`) && (
                        <div className="invalid-feedback">
                          {getFieldError(`items[${index}].name`)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">{t('orders.quantity')}*</label>
                      <input 
                        type="number" 
                        min="1"
                        value={item.quantity || ''} 
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`form-control ${getFieldError(`items[${index}].quantity`) ? 'is-invalid' : ''}`}
                      />
                      {getFieldError(`items[${index}].quantity`) && (
                        <div className="invalid-feedback">
                          {getFieldError(`items[${index}].quantity`)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="mb-3">
                      <label className="form-label">{t('orders.price')}*</label>
                      <div className="input-group">
                        <input 
                          type="number" 
                          min="0" 
                          step="1000"
                          value={item.price || ''} 
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className={`form-control ${getFieldError(`items[${index}].price`) ? 'is-invalid' : ''}`}
                        />
                        {getFieldError(`items[${index}].price`) && (
                          <div className="invalid-feedback">
                            {getFieldError(`items[${index}].price`)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div>
                      <label className="form-label">{t('orders.subtotal')}</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={formatCurrency(item.subtotal)}
                        className="form-control-plaintext fw-bold"
                      />
                    </div>
                  </div>
                  <div className="col-md-2 d-flex align-items-center">
                    <button 
                      type="button"
                      className="btn btn-outline-danger btn-sm me-2"
                      onClick={() => removeItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <FaMinus />
                    </button>
                    {index === formData.items.length - 1 && (
                      <button 
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={addItem}
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="row mt-4">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label">{t('orders.notes')}</label>
                    <textarea 
                      rows={3} 
                      name="notes" 
                      value={formData.notes || ''} 
                      onChange={handleChange} 
                      className="form-control"
                    ></textarea>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="mb-3">{t('orders.orderSummary')}</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{t('orders.items')}:</span>
                        <span>{formData.items.length}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>{t('orders.quantity')}:</span>
                        <span>
                          {formData.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>{t('orders.grandTotal')}:</span>
                        <span>{formatCurrency(formData.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('orders.status')}</label>
                    <select 
                      name="status" 
                      value={formData.status || 'pending'} 
                      onChange={handleChange} 
                      className="form-select"
                    >
                      <option value="pending">{t('orders.statuses.pending')}</option>
                      <option value="processing">{t('orders.statuses.processing')}</option>
                      <option value="completed">{t('orders.statuses.completed')}</option>
                      <option value="cancelled">{t('orders.statuses.cancelled')}</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t('orders.paymentStatus')}</label>
                    <select 
                      name="paymentStatus" 
                      value={formData.paymentStatus || 'pending'} 
                      onChange={handleChange} 
                      className="form-select"
                    >
                      <option value="pending">{t('orders.paymentStatuses.pending')}</option>
                      <option value="paid">{t('orders.paymentStatuses.paid')}</option>
                      <option value="refunded">{t('orders.paymentStatuses.refunded')}</option>
                      <option value="failed">{t('orders.paymentStatuses.failed')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  )}
                  <FaSave className="me-1" />
                  {isEditing ? t('common.save') : t('common.create')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm; 