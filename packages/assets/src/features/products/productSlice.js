import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../../config/firebase';

// Lấy danh sách sản phẩm
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const productsRef = collection(db, 'products');
      
      // Xây dựng query với các bộ lọc
      let productsQuery = productsRef;
      
      if (filters.category) {
        productsQuery = query(productsQuery, where('category', '==', filters.category));
      }
      
      if (filters.status) {
        productsQuery = query(productsQuery, where('status', '==', filters.status));
      }
      
      // Thêm sắp xếp
      const sortField = filters.sortField || 'createdAt';
      const sortDirection = filters.sortDirection || 'desc';
      productsQuery = query(productsQuery, orderBy(sortField, sortDirection));
      
      // Nếu có limit
      if (filters.limit) {
        productsQuery = query(productsQuery, limit(filters.limit));
      }
      
      const snapshot = await getDocs(productsQuery);
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy chi tiết một sản phẩm
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Sản phẩm không tồn tại');
      }
      
      return {
        id: productDoc.id,
        ...productDoc.data()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thêm sản phẩm mới
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async ({ productData, image }, { rejectWithValue }) => {
    try {
      // Tạo tham chiếu sản phẩm trong Firestore
      const productRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Nếu có ảnh, upload lên Storage
      let imageUrl = '';
      if (image) {
        const storageRef = ref(storage, `products/${productRef.id}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
        
        // Cập nhật URL ảnh vào Firestore
        await updateDoc(productRef, { imageUrl });
      }
      
      // Trả về dữ liệu đã tạo
      return {
        id: productRef.id,
        ...productData,
        imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật sản phẩm
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData, image }, { rejectWithValue }) => {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Nếu có ảnh mới, upload lên Storage
      let imageUrl = productData.imageUrl || '';
      if (image) {
        const storageRef = ref(storage, `products/${productId}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Dữ liệu cập nhật
      const updateData = {
        ...productData,
        imageUrl,
        updatedAt: new Date()
      };
      
      // Cập nhật dữ liệu trong Firestore
      await updateDoc(productRef, updateData);
      
      // Trả về dữ liệu đã cập nhật
      return {
        id: productId,
        ...updateData
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa sản phẩm
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      // Xóa tài liệu từ Firestore
      await deleteDoc(doc(db, 'products', productId));
      
      // Xóa ảnh từ Storage nếu có
      try {
        const storageRef = ref(storage, `products/${productId}`);
        await deleteObject(storageRef);
      } catch (error) {
        // Bỏ qua lỗi nếu ảnh không tồn tại
        console.log('Không tìm thấy ảnh để xóa hoặc đã xóa trước đó');
      }
      
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Khởi tạo state
const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  success: false
};

// Tạo product slice
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.product = null;
      state.error = null;
      state.success = false;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý addProduct
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.success = true;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Xử lý updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        );
        state.product = action.payload;
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Xử lý deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetProductState, setFilters } = productSlice.actions;

export default productSlice.reducer; 