const admin = require('firebase-admin');
const { getRepository } = require('../repositories/index');

const orderRepository = getRepository('order');

/**
 * Get orders with filtering and pagination
 */
exports.getOrders = async ({ status, startDate, endDate, limit, offset, sortBy, sortOrder }) => {
  try {
    // Create query filters
    const filters = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (startDate && endDate) {
      filters.createdAt = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    }
    
    // Get orders from repository
    const result = await orderRepository.findAll({
      filters,
      pagination: { limit, offset },
      sorting: { field: sortBy, order: sortOrder }
    });
    
    return {
      orders: result.items,
      pagination: {
        total: result.total,
        limit,
        offset
      }
    };
  } catch (error) {
    throw new Error(`Error getting orders: ${error.message}`);
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (id) => {
  try {
    const order = await orderRepository.findById(id);
    
    if (!order) {
      return null;
    }
    
    return order;
  } catch (error) {
    throw new Error(`Error getting order by ID: ${error.message}`);
  }
};

/**
 * Create a new order
 */
exports.createOrder = async (orderData) => {
  try {
    // Add timestamps
    const now = admin.firestore.FieldValue.serverTimestamp();
    const newOrder = {
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    // Create order
    const result = await orderRepository.create(newOrder);
    
    // Process order (trigger inventory updates, payments, etc.)
    await processOrder(result);
    
    return result;
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

/**
 * Update an order
 */
exports.updateOrder = async (id, orderData) => {
  try {
    // Add updated timestamp
    const updateData = {
      ...orderData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Update order
    const result = await orderRepository.update(id, updateData);
    
    if (!result) {
      return null;
    }
    
    return result;
  } catch (error) {
    throw new Error(`Error updating order: ${error.message}`);
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (id, status, userId) => {
  try {
    // Add updated timestamp
    const updateData = {
      status,
      statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      statusUpdatedBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Update order
    const result = await orderRepository.update(id, updateData);
    
    if (!result) {
      return null;
    }
    
    // Handle status change side effects
    await handleStatusChange(id, status);
    
    return result;
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
};

/**
 * Delete an order
 */
exports.deleteOrder = async (id) => {
  try {
    // Delete order
    const result = await orderRepository.delete(id);
    
    return result;
  } catch (error) {
    throw new Error(`Error deleting order: ${error.message}`);
  }
};

/**
 * Bulk update orders
 */
exports.bulkUpdateOrders = async (orderIds, updateData, userId) => {
  try {
    // Add updated timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId
    };
    
    // Bulk update
    const result = await orderRepository.bulkUpdate(orderIds, dataToUpdate);
    
    return {
      updated: result,
      orderIds
    };
  } catch (error) {
    throw new Error(`Error bulk updating orders: ${error.message}`);
  }
};

/**
 * Bulk delete orders
 */
exports.bulkDeleteOrders = async (orderIds) => {
  try {
    // Bulk delete
    const result = await orderRepository.bulkDelete(orderIds);
    
    return {
      deleted: result,
      orderIds
    };
  } catch (error) {
    throw new Error(`Error bulk deleting orders: ${error.message}`);
  }
};

/**
 * Bulk update order statuses
 */
exports.bulkUpdateOrderStatuses = async (orderIds, status, userId) => {
  try {
    // Add status update metadata
    const statusData = {
      status,
      statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      statusUpdatedBy: userId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: userId
    };
    
    // Bulk update statuses
    const result = await orderRepository.bulkUpdate(orderIds, statusData);
    
    // Handle status change side effects for each order
    await Promise.all(orderIds.map(id => handleStatusChange(id, status)));
    
    return {
      updated: result,
      orderIds,
      status
    };
  } catch (error) {
    throw new Error(`Error bulk updating order statuses: ${error.message}`);
  }
};

/* Private helper functions */

/**
 * Process a new order
 */
async function processOrder(order) {
  // Implement order processing logic here
  // e.g., update inventory, process payment, send notifications
  
  // For now, just log
  console.log(`Processing new order: ${order.id}`);
}

/**
 * Handle order status change side effects
 */
async function handleStatusChange(orderId, newStatus) {
  // Implement status change logic here based on the new status
  // e.g., send notifications, update inventory, etc.
  
  // For now, just log
  console.log(`Order ${orderId} status changed to ${newStatus}`);
} 