const admin = require('firebase-admin');
const db = admin.firestore();

const ordersCollection = db.collection('orders');

/**
 * Repository cho đơn hàng
 */
const orderRepository = {
  /**
   * Lấy tất cả đơn hàng
   */
  getAll: async () => {
    const snapshot = await ordersCollection.get();
    const orders = [];
    
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return orders;
  },
  
  /**
   * Lấy đơn hàng theo ID
   * @param {string} id ID của đơn hàng
   */
  getById: async (id) => {
    const doc = await ordersCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  },
  
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData Dữ liệu đơn hàng
   */
  create: async (orderData) => {
    const newOrder = {
      ...orderData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await ordersCollection.add(newOrder);
    
    return {
      id: docRef.id,
      ...newOrder
    };
  },
  
  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} id ID của đơn hàng
   * @param {string} status Trạng thái mới
   */
  updateStatus: async (id, status) => {
    await ordersCollection.doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  },
  
  /**
   * Xóa đơn hàng
   * @param {string} id ID của đơn hàng
   */
  delete: async (id) => {
    await ordersCollection.doc(id).delete();
    return true;
  }
};

module.exports = orderRepository; 