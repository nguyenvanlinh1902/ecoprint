const admin = require('firebase-admin');
const db = admin.firestore();

const productsCollection = db.collection('products');

/**
 * Repository cho sản phẩm
 */
const productRepository = {
  /**
   * Lấy tất cả sản phẩm với các bộ lọc
   * @param {Object} filters Các bộ lọc (category, type)
   */
  getAll: async (filters = {}) => {
    let query = productsCollection;
    
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    
    const snapshot = await query.get();
    const products = [];
    
    snapshot.forEach(doc => {
      const productData = doc.data();
      
      // Lọc theo tên sản phẩm (client-side filtering)
      if (filters.search && !productData.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return;
      }
      
      products.push({
        id: doc.id,
        ...productData
      });
    });
    
    return products;
  },
  
  /**
   * Lấy sản phẩm theo ID
   * @param {string} id ID của sản phẩm
   */
  getById: async (id) => {
    const doc = await productsCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  },
  
  /**
   * Tạo sản phẩm mới
   * @param {Object} productData Dữ liệu sản phẩm
   */
  create: async (productData) => {
    const newProduct = {
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await productsCollection.add(newProduct);
    
    return {
      id: docRef.id,
      ...newProduct
    };
  },
  
  /**
   * Cập nhật sản phẩm
   * @param {string} id ID của sản phẩm
   * @param {Object} productData Dữ liệu cập nhật
   */
  update: async (id, productData) => {
    const updateData = {
      ...productData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await productsCollection.doc(id).update(updateData);
    
    return true;
  },
  
  /**
   * Xóa sản phẩm
   * @param {string} id ID của sản phẩm
   */
  delete: async (id) => {
    await productsCollection.doc(id).delete();
    return true;
  }
};

module.exports = productRepository; 