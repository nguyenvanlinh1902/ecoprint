const Router = require('koa-router');
const admin = require('firebase-admin');

// Không khởi tạo db ở đây, mà dùng lazily trong mỗi route handler
const router = new Router({
  prefix: '/orders'
});

// Lấy danh sách đơn hàng
router.get('/', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const ordersSnapshot = await db.collection('orders').get();
    const orders = [];
    
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    ctx.body = {
      status: 'success',
      data: orders
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const id = ctx.params.id;
    const doc = await db.collection('orders').doc(id).get();
    
    if (!doc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Đơn hàng không tồn tại'
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

// Tạo đơn hàng mới
router.post('/', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const orderData = ctx.request.body;
    
    // Validate dữ liệu đơn hàng ở đây
    
    const newOrder = {
      ...orderData,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('orders').add(newOrder);
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      data: {
        id: docRef.id,
        ...newOrder
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

// Cập nhật trạng thái đơn hàng
router.put('/:id/status', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const id = ctx.params.id;
    const { status } = ctx.request.body;
    
    // Validate trạng thái hợp lệ
    const validStatuses = ['pending', 'processing', 'in_production', 'fulfilled', 'completed', 'refunded', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Trạng thái không hợp lệ'
      };
      return;
    }
    
    await db.collection('orders').doc(id).update({ 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    ctx.body = {
      status: 'success',
      message: 'Cập nhật trạng thái thành công'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Xóa đơn hàng
router.delete('/:id', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const id = ctx.params.id;
    await db.collection('orders').doc(id).delete();
    
    ctx.body = {
      status: 'success',
      message: 'Đơn hàng đã được xóa'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

module.exports = { ordersRouter: router }; 