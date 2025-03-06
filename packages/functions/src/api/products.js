const Router = require('koa-router');
const admin = require('firebase-admin');

// Không khởi tạo db ở đây, mà dùng lazily trong mỗi route handler
const router = new Router({
  prefix: '/products'
});

// Lấy danh sách sản phẩm
router.get('/', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const { category, type, search } = ctx.query;
    let query = db.collection('products');
    
    // Áp dụng bộ lọc
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const productsSnapshot = await query.get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      const productData = doc.data();
      
      // Áp dụng tìm kiếm (client-side filtering nếu cần)
      if (search && !productData.name.toLowerCase().includes(search.toLowerCase())) {
        return;
      }
      
      products.push({
        id: doc.id,
        ...productData
      });
    });
    
    ctx.body = {
      status: 'success',
      data: products
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Lấy chi tiết sản phẩm
router.get('/:id', async (ctx) => {
  try {
    const id = ctx.params.id;
    const doc = await admin.firestore().collection('products').doc(id).get();
    
    if (!doc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Sản phẩm không tồn tại'
      };
      return;
    }
    
    ctx.body = {
      status: 'success',
      data: {
        id: doc.id,
        ...doc.data()
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

// Thêm sản phẩm mới
router.post('/', async (ctx) => {
  try {
    const productData = ctx.request.body;
    
    // Validate dữ liệu sản phẩm ở đây
    
    const newProduct = {
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('products').add(newProduct);
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
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

// Cập nhật sản phẩm
router.put('/:id', async (ctx) => {
  try {
    const id = ctx.params.id;
    const productData = ctx.request.body;
    
    // Validate dữ liệu sản phẩm ở đây
    
    const updateData = {
      ...productData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('products').doc(id).update(updateData);
    
    ctx.body = {
      status: 'success',
      message: 'Cập nhật sản phẩm thành công'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Xóa sản phẩm
router.delete('/:id', async (ctx) => {
  try {
    const id = ctx.params.id;
    await admin.firestore().collection('products').doc(id).delete();
    
    ctx.body = {
      status: 'success',
      message: 'Sản phẩm đã được xóa'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

module.exports = { productsRouter: router }; 