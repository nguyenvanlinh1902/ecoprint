const admin = require('firebase-admin');

// Lazy initialization - admin should already be initialized in index.js
const getFirestore = () => admin.firestore();
const getCollection = () => getFirestore().collection('orders');

/**
 * Find all orders with filtering and pagination
 */
exports.findAll = async ({ filters = {}, pagination = {}, sorting = {} }) => {
  try {
    const collection = getCollection();
    let query = collection;
    
    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.createdAt) {
      const { startDate, endDate } = filters.createdAt;
      query = query.where('createdAt', '>=', startDate)
                  .where('createdAt', '<=', endDate);
    }
    
    // Apply sorting
    const { field = 'createdAt', order = 'desc' } = sorting;
    query = query.orderBy(field, order);
    
    // Apply pagination
    const { limit = 50, offset = 0 } = pagination;
    
    if (offset > 0) {
      // Get the last document from the previous page
      const offsetSnapshot = await collection
        .orderBy(field, order)
        .limit(offset)
        .get();
      
      const lastVisible = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
      query = query.startAfter(lastVisible);
    }
    
    query = query.limit(limit);
    
    // Execute query
    const snapshot = await query.get();
    
    // Get total count (this would normally use a more efficient approach)
    const countSnapshot = await collection.count().get();
    const total = countSnapshot.data().count;
    
    // Map documents to objects
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      items,
      total
    };
  } catch (error) {
    throw new Error(`Error finding orders: ${error.message}`);
  }
};

/**
 * Find order by ID
 */
exports.findById = async (id) => {
  try {
    const collection = getCollection();
    const doc = await collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    throw new Error(`Error finding order by ID: ${error.message}`);
  }
};

/**
 * Create a new order
 */
exports.create = async (data) => {
  try {
    const collection = getCollection();
    const docRef = await collection.add(data);
    
    // Get the created document
    const doc = await docRef.get();
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

/**
 * Update an order
 */
exports.update = async (id, data) => {
  try {
    const collection = getCollection();
    const docRef = collection.doc(id);
    
    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    
    // Update document
    await docRef.update(data);
    
    // Get the updated document
    const updatedDoc = await docRef.get();
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    throw new Error(`Error updating order: ${error.message}`);
  }
};

/**
 * Delete an order
 */
exports.delete = async (id) => {
  try {
    const collection = getCollection();
    const docRef = collection.doc(id);
    
    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return false;
    }
    
    // Delete document
    await docRef.delete();
    
    return true;
  } catch (error) {
    throw new Error(`Error deleting order: ${error.message}`);
  }
};

/**
 * Bulk update orders
 */
exports.bulkUpdate = async (ids, data) => {
  try {
    const db = getFirestore();
    const batch = db.batch();
    const collection = getCollection();
    
    // Add each document to the batch
    ids.forEach(id => {
      const docRef = collection.doc(id);
      batch.update(docRef, data);
    });
    
    // Commit the batch
    await batch.commit();
    
    return ids.length;
  } catch (error) {
    throw new Error(`Error bulk updating orders: ${error.message}`);
  }
};

/**
 * Bulk delete orders
 */
exports.bulkDelete = async (ids) => {
  try {
    const db = getFirestore();
    const batch = db.batch();
    const collection = getCollection();
    
    // Add each document to the batch
    ids.forEach(id => {
      const docRef = collection.doc(id);
      batch.delete(docRef);
    });
    
    // Commit the batch
    await batch.commit();
    
    return ids.length;
  } catch (error) {
    throw new Error(`Error bulk deleting orders: ${error.message}`);
  }
}; 