const Router = require('koa-router');
const admin = require('firebase-admin');

const router = new Router({
  prefix: '/products'
});

// Get all products with filtering and pagination
router.get('/', async (ctx) => {
  try {
    const db = admin.firestore();
    const { 
      category,
      status,
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = ctx.query;
    
    let query = db.collection('products');
    
    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);
    
    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));
    
    const productsSnapshot = await query.get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get total count for pagination
    const countSnapshot = await db.collection('products').count().get();
    const totalCount = countSnapshot.data().count;
    
    ctx.body = {
      status: 'success',
      data: {
        products,
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

// Create new product
router.post('/', async (ctx) => {
  try {
    const db = admin.firestore();
    const productData = ctx.request.body;
    
    // Validate product data here
    if (!productData.name || !productData.price) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Product name and price are required'
      };
      return;
    }
    
    const newProduct = {
      ...productData,
      status: productData.status || 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: ctx.state.user.uid
    };
    
    const docRef = await db.collection('products').add(newProduct);
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: 'Product created successfully',
      data: {
        id: docRef.id,
        ...newProduct
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

// Update product
router.put('/:id', async (ctx) => {
  try {
    const db = admin.firestore();
    const id = ctx.params.id;
    const productData = ctx.request.body;
    
    // Validate product data here
    
    const updateData = {
      ...productData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: ctx.state.user.uid
    };
    
    await db.collection('products').doc(id).update(updateData);
    
    ctx.body = {
      status: 'success',
      message: 'Product updated successfully',
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

// Delete product
router.delete('/:id', async (ctx) => {
  try {
    const db = admin.firestore();
    const id = ctx.params.id;
    
    // Check if product exists
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Product not found'
      };
      return;
    }
    
    await db.collection('products').doc(id).delete();
    
    ctx.body = {
      status: 'success',
      message: 'Product deleted successfully',
      data: {
        id
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

// Bulk operations on products
router.post('/bulk-action', async (ctx) => {
  try {
    const db = admin.firestore();
    const { action, productIds, updateData } = ctx.request.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Product IDs must be provided as a non-empty array'
      };
      return;
    }
    
    if (!action || !['update', 'delete', 'publish', 'unpublish'].includes(action)) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Valid action must be provided (update, delete, publish, unpublish)'
      };
      return;
    }
    
    const batch = db.batch();
    let successMessage = '';
    
    if (action === 'update') {
      if (!updateData || Object.keys(updateData).length === 0) {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: 'Update data must be provided for bulk update'
        };
        return;
      }
      
      productIds.forEach(id => {
        const docRef = db.collection('products').doc(id);
        batch.update(docRef, {
          ...updateData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: ctx.state.user.uid
        });
      });
      
      successMessage = `Successfully updated ${productIds.length} products`;
    } else if (action === 'delete') {
      productIds.forEach(id => {
        const docRef = db.collection('products').doc(id);
        batch.delete(docRef);
      });
      
      successMessage = `Successfully deleted ${productIds.length} products`;
    } else if (action === 'publish' || action === 'unpublish') {
      const newStatus = action === 'publish' ? 'active' : 'draft';
      
      productIds.forEach(id => {
        const docRef = db.collection('products').doc(id);
        batch.update(docRef, {
          status: newStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: ctx.state.user.uid
        });
      });
      
      successMessage = `Successfully ${action}ed ${productIds.length} products`;
    }
    
    // Commit the batch
    await batch.commit();
    
    ctx.body = {
      status: 'success',
      message: successMessage,
      data: {
        action,
        productIds
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

module.exports = { adminProductsRouter: router }; 