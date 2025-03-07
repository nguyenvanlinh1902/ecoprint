const orderService = require('../services/order.service');
const { validateOrder, validateOrderStatus } = require('../validators/order.validator');

/**
 * Get list of orders with filtering and pagination
 */
exports.getOrders = async (ctx) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = ctx.query;
    
    const result = await orderService.getOrders({ 
      status, 
      startDate, 
      endDate, 
      limit: parseInt(limit), 
      offset: parseInt(offset),
      sortBy,
      sortOrder
    });
    
    ctx.body = {
      status: 'success',
      data: result
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (ctx) => {
  try {
    const { id } = ctx.params;
    const order = await orderService.getOrderById(id);
    
    if (!order) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Order not found'
      };
      return;
    }
    
    ctx.body = {
      status: 'success',
      data: order
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Create a new order
 */
exports.createOrder = async (ctx) => {
  try {
    const orderData = ctx.request.body;
    
    // Validate order data
    const { error } = validateOrder(orderData);
    if (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Validation error',
        details: error.details
      };
      return;
    }
    
    // Add user information
    const userId = ctx.state.user.uid;
    const newOrder = await orderService.createOrder({
      ...orderData,
      createdBy: userId
    });
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: 'Order created successfully',
      data: newOrder
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Update an order
 */
exports.updateOrder = async (ctx) => {
  try {
    const { id } = ctx.params;
    const orderData = ctx.request.body;
    
    // Validate order data
    const { error } = validateOrder(orderData);
    if (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Validation error',
        details: error.details
      };
      return;
    }
    
    // Add user information
    const userId = ctx.state.user.uid;
    const updatedOrder = await orderService.updateOrder(id, {
      ...orderData,
      updatedBy: userId
    });
    
    if (!updatedOrder) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Order not found'
      };
      return;
    }
    
    ctx.body = {
      status: 'success',
      message: 'Order updated successfully',
      data: updatedOrder
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { status } = ctx.request.body;
    
    // Validate status
    const { error } = validateOrderStatus(status);
    if (error) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Invalid status value',
        details: error.details
      };
      return;
    }
    
    // Add user information
    const userId = ctx.state.user.uid;
    const updatedOrder = await orderService.updateOrderStatus(id, status, userId);
    
    if (!updatedOrder) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Order not found'
      };
      return;
    }
    
    ctx.body = {
      status: 'success',
      message: 'Order status updated successfully',
      data: updatedOrder
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Delete an order
 */
exports.deleteOrder = async (ctx) => {
  try {
    const { id } = ctx.params;
    const deleted = await orderService.deleteOrder(id);
    
    if (!deleted) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Order not found'
      };
      return;
    }
    
    ctx.body = {
      status: 'success',
      message: 'Order deleted successfully',
      data: { id }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
};

/**
 * Bulk update orders
 */
exports.bulkOrderOperations = async (ctx) => {
  try {
    const { action, orderIds, updateData } = ctx.request.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Order IDs must be provided as a non-empty array'
      };
      return;
    }
    
    if (!action || !['update', 'delete', 'updateStatus'].includes(action)) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Valid action must be provided (update, delete, updateStatus)'
      };
      return;
    }
    
    // Add user information
    const userId = ctx.state.user.uid;
    
    let result;
    if (action === 'update') {
      if (!updateData || Object.keys(updateData).length === 0) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'Update data must be provided for bulk update'
        };
        return;
      }
      
      result = await orderService.bulkUpdateOrders(orderIds, updateData, userId);
    } else if (action === 'delete') {
      result = await orderService.bulkDeleteOrders(orderIds);
    } else if (action === 'updateStatus') {
      if (!updateData || !updateData.status) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'Status must be provided for bulk status update'
        };
        return;
      }
      
      result = await orderService.bulkUpdateOrderStatuses(orderIds, updateData.status, userId);
    }
    
    ctx.body = {
      status: 'success',
      message: `Successfully ${action === 'update' ? 'updated' : action === 'delete' ? 'deleted' : 'updated status of'} ${orderIds.length} orders`,
      data: result
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
}; 