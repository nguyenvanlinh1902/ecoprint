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
import { 
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../../../config/firebase';

const productsCollection = collection(db, 'products');

/**
 * Service quản lý các API call liên quan đến sản phẩm
 */
export const productService = {
  /**
   * Lấy danh sách sản phẩm
   * @param {Object} options - Tùy chọn lọc và sắp xếp
   * @returns {Promise<Array>} Danh sách sản phẩm
   */
  getProducts: async (options = {}) => {
    try {
      let productQuery = query(productsCollection);
      
      // Áp dụng bộ lọc theo danh mục
      if (options.category) {
        productQuery = query(productQuery, where('category', '==', options.category));
      }
      
      // Áp dụng bộ lọc theo trạng thái
      if (options.status) {
        productQuery = query(productQuery, where('status', '==', options.status));
      }
      
      // Áp dụng sắp xếp
      if (options.sort) {
        switch (options.sort) {
          case 'newest':
            productQuery = query(productQuery, orderBy('createdAt', 'desc'));
            break;
          case 'oldest':
            productQuery = query(productQuery, orderBy('createdAt', 'asc'));
            break;
          case 'price_asc':
            productQuery = query(productQuery, orderBy('price', 'asc'));
            break;
          case 'price_desc':
            productQuery = query(productQuery, orderBy('price', 'desc'));
            break;
          case 'name_asc':
            productQuery = query(productQuery, orderBy('name', 'asc'));
            break;
          case 'name_desc':
            productQuery = query(productQuery, orderBy('name', 'desc'));
            break;
          default:
            productQuery = query(productQuery, orderBy('createdAt', 'desc'));
        }
      } else {
        // Mặc định sắp xếp theo thời gian tạo mới nhất
        productQuery = query(productQuery, orderBy('createdAt', 'desc'));
      }
      
      // Giới hạn số lượng kết quả nếu có
      if (options.limit) {
        productQuery = query(productQuery, limit(options.limit));
      }
      
      const querySnapshot = await getDocs(productQuery);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },
  
  /**
   * Lấy thông tin chi tiết sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<Object>} Thông tin sản phẩm
   */
  getProductById: async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (!productDoc.exists()) {
        throw new Error('Sản phẩm không tồn tại');
      }
      
      return {
        id: productDoc.id,
        ...productDoc.data()
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },
  
  /**
   * Thêm sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm
   * @param {File} image - Tệp ảnh sản phẩm (optional)
   * @returns {Promise<Object>} Thông tin sản phẩm đã tạo
   */
  addProduct: async (productData, image) => {
    try {
      // Thêm timestamp
      const productWithTimestamp = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Upload ảnh nếu có
      if (image) {
        const imageRef = storageRef(storage, `products/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        productWithTimestamp.imageUrl = imageUrl;
        productWithTimestamp.imagePath = imageRef.fullPath;
      }
      
      // Thêm sản phẩm vào Firestore
      const docRef = await addDoc(productsCollection, productWithTimestamp);
      
      return {
        id: docRef.id,
        ...productWithTimestamp
      };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin sản phẩm
   * @param {string} productId - ID của sản phẩm
   * @param {Object} productData - Dữ liệu sản phẩm cần cập nhật
   * @param {File} image - Tệp ảnh mới (optional)
   * @returns {Promise<Object>} Thông tin sản phẩm đã cập nhật
   */
  updateProduct: async (productId, productData, image) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Sản phẩm không tồn tại');
      }
      
      const currentProduct = productDoc.data();
      const updatedProduct = {
        ...productData,
        updatedAt: serverTimestamp()
      };
      
      // Upload ảnh mới nếu có
      if (image) {
        // Xóa ảnh cũ nếu có
        if (currentProduct.imagePath) {
          const oldImageRef = storageRef(storage, currentProduct.imagePath);
          try {
            await deleteObject(oldImageRef);
          } catch (error) {
            console.warn('Old image not found or already deleted:', error);
          }
        }
        
        // Upload ảnh mới
        const imageRef = storageRef(storage, `products/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        
        updatedProduct.imageUrl = imageUrl;
        updatedProduct.imagePath = imageRef.fullPath;
      }
      
      // Cập nhật sản phẩm trong Firestore
      await updateDoc(productRef, updatedProduct);
      
      return {
        id: productId,
        ...updatedProduct
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  
  /**
   * Xóa sản phẩm
   * @param {string} productId - ID của sản phẩm
   * @returns {Promise<boolean>} Kết quả xóa
   */
  deleteProduct: async (productId) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Sản phẩm không tồn tại');
      }
      
      // Xóa ảnh trong Storage nếu có
      const product = productDoc.data();
      if (product.imagePath) {
        const imageRef = storageRef(storage, product.imagePath);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Image not found or already deleted:', error);
        }
      }
      
      // Xóa sản phẩm trong Firestore
      await deleteDoc(productRef);
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}; 