import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

const ordersCollection = collection(db, 'orders');

/**
 * Service for handling order-related API calls
 */
export const orderService = {
  /**
   * Get list of orders with filtering and sorting options
   * @param {Object} options - Filter and sort options
   * @returns {Promise<Array>} List of orders
   */
  getOrders: async (options = {}) => {
    try {
      let orderQuery = query(ordersCollection);
      
      // Apply status filter
      if (options.status) {
        orderQuery = query(orderQuery, where('status', '==', options.status));
      }
      
      // Apply user filter
      if (options.userId) {
        orderQuery = query(orderQuery, where('userId', '==', options.userId));
      }
      
      // Apply date range filter
      if (options.startDate && options.endDate) {
        orderQuery = query(
          orderQuery, 
          where('createdAt', '>=', options.startDate),
          where('createdAt', '<=', options.endDate)
        );
      }
      
      // Apply sorting
      if (options.sort) {
        const [field, direction] = options.sort.split(':');
        orderQuery = query(orderQuery, orderBy(field, direction || 'asc'));
      } else {
        // Default sort by creation date (newest first)
        orderQuery = query(orderQuery, orderBy('createdAt', 'desc'));
      }
      
      // Apply pagination
      if (options.limit) {
        orderQuery = query(orderQuery, limit(parseInt(options.limit)));
      }
      
      const snapshot = await getDocs(orderQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific order by ID
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} Order data
   */
  getOrderById: async (orderId) => {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  createOrder: async (orderData) => {
    try {
      const newOrder = {
        ...orderData,
        status: orderData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(ordersCollection, newOrder);
      
      return {
        id: docRef.id,
        ...newOrder
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing order
   * @param {string} orderId - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} Updated order
   */
  updateOrder: async (orderId, orderData) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      
      const updatedData = {
        ...orderData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(orderRef, updatedData);
      
      return {
        id: orderId,
        ...updatedData
      };
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an order
   * @param {string} orderId - Order ID
   * @returns {Promise<void>}
   */
  deleteOrder: async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  }
}; 