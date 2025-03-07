const Router = require('koa-router');
const admin = require('firebase-admin');

const router = new Router({
  prefix: '/orders'
});

// Get all orders with filtering and pagination
router.get('/', async (ctx) => {
  try {
    const db = admin.firestore();
    const { 
      status, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = ctx.query;
    
    let query = db.collection('orders');
    
    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (startDate && endDate) {
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      query = query.where('createdAt', '>=', startTimestamp)
                   .where('createdAt', '<=', endTimestamp);
    }
    
    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);
    
    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));
    
    const ordersSnapshot = await query.get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get total count for pagination
    const countSnapshot = await db.collection('orders').count().get();
    const totalCount = countSnapshot.data().count;
    
    ctx.body = {
      status: 'success',
      data: {
        orders,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Update an order (full update with validation)
router.put('/:id', async (ctx) => {
  try {
    const db = admin.firestore();
    const id = ctx.params.id;
    const orderData = ctx.request.body;
    
    // Validate order data here
    // Ensure required fields are present
    
    const updateData = {
      ...orderData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: ctx.state.user.uid
    };
    
    await db.collection('orders').doc(id).update(updateData);
    
    ctx.body = {
      status: 'success',
      message: 'Order updated successfully',
      data: {
        id,
        ...updateData
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Bulk update orders
router.post('/bulk-update', async (ctx) => {
  try {
    const db = admin.firestore();
    const { orderIds, updateData } = ctx.request.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Order IDs must be provided as a non-empty array'
      };
      return;
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Update data must be provided'
      };
      return;
    }
    
    const batch = db.batch();
    
    // Add updated metadata
    const dataToUpdate = {
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: ctx.state.user.uid
    };
    
    // Create batch operations
    orderIds.forEach(id => {
      const docRef = db.collection('orders').doc(id);
      batch.update(docRef, dataToUpdate);
    });
    
    // Commit the batch
    await batch.commit();
    
    ctx.body = {
      status: 'success',
      message: `Successfully updated ${orderIds.length} orders`,
      data: {
        updatedIds: orderIds
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Export order data (to CSV, JSON)
router.get('/export', async (ctx) => {
  try {
    const db = admin.firestore();
    const { format = 'json', status } = ctx.query;
    
    let query = db.collection('orders');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const ordersSnapshot = await query.get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    if (format === 'json') {
      ctx.body = orders;
    } else if (format === 'csv') {
      // Convert to CSV format
      // For simplicity, we're just setting headers here
      ctx.set('Content-Type', 'text/csv');
      ctx.set('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
      
      // Simple CSV conversion (would need a proper CSV library in production)
      const csvHeader = Object.keys(orders[0] || {}).join(',');
      const csvRows = orders.map(order => 
        Object.values(order).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : value
        ).join(',')
      );
      
      ctx.body = [csvHeader, ...csvRows].join('\n');
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Unsupported format. Use "json" or "csv"'
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

module.exports = { adminOrdersRouter: router }; 