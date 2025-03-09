/**
 * Controller xử lý các yêu cầu liên quan đến đơn hàng
 */
import orderService from '../services/orderService.js';
import productService from '../services/productService.js';
import orderModel from '../models/orderModel.js';
import creditService from '../services/creditService.js';
import productModel from '../models/productModel.js';

const orderController = {
  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (ctx) => {
    try {
      const orderData = ctx.request.body;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Thêm thông tin người dùng vào đơn hàng
      orderData.customerId = user.uid;
      orderData.customerName = user.fullName || user.displayName;
      orderData.customerEmail = user.email;
      orderData.customerPhone = user.phone;
      
      // Đảm bảo phương thức thanh toán là credit
      orderData.paymentMethod = orderModel.PAYMENT_METHODS.CREDIT;
      
      // Kiểm tra số dư trước khi xử lý đơn hàng
      const estimatedTotal = await orderService.estimateOrderTotal(orderData);
      const hasEnoughCredit = await creditService.checkBalance(user.uid, estimatedTotal);
      
      if (!hasEnoughCredit) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Số dư credit không đủ để thanh toán. Vui lòng nạp thêm credit.'
        };
        return;
      }
      
      // Kiểm tra và xử lý các mặt hàng có phí bổ sung
      if (orderData.items && Array.isArray(orderData.items)) {
        for (let i = 0; i < orderData.items.length; i++) {
          const item = orderData.items[i];
          
          // Lấy thông tin sản phẩm
          const product = await productService.getProduct(item.id);
          
          // Kiểm tra xem sản phẩm có yêu cầu phí bổ sung không
          if (productModel.requiresAdditionalFees(item.type) && (!item.customOptions || Object.keys(item.customOptions).length === 0)) {
            ctx.status = 400;
            ctx.body = {
              success: false,
              message: `Thiếu thông tin tùy chỉnh cho sản phẩm "${item.name}"`
            };
            return;
          }
          
          // Tính toán phí bổ sung cho sản phẩm
          const appliedFees = await orderService.calculateAdditionalFees(
            product,
            item.customOptions || {}
          );
          
          // Thêm phí đã tính vào mặt hàng
          orderData.items[i].appliedFees = appliedFees;
        }
      }
      
      // Tạo đơn hàng
      const newOrder = await orderService.createOrder(orderData);
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Đơn hàng đã được tạo thành công',
        data: newOrder
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy thông tin đơn hàng
   */
  getOrder: async (ctx) => {
    try {
      const { orderId } = ctx.params;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      const order = await orderService.getOrder(orderId);
      
      // Kiểm tra quyền truy cập
      if (user.role !== 'admin' && order.customerId !== user.uid) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền truy cập đơn hàng này' };
        return;
      }
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: order
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   */
  getCustomerOrders: async (ctx) => {
    try {
      const { customerId } = ctx.params;
      const { limit = 10, offset = 0 } = ctx.query;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Nếu không phải admin, chỉ có thể xem đơn hàng của chính mình
      if (user.role !== 'admin' && user.uid !== customerId) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền truy cập' };
        return;
      }
      
      const orders = await orderService.getCustomerOrders(
        customerId,
        parseInt(limit, 10),
        parseInt(offset, 10)
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: orders
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: async (ctx) => {
    try {
      const { orderId } = ctx.params;
      const { status } = ctx.request.body;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Kiểm tra quyền cập nhật
      const order = await orderService.getOrder(orderId);
      
      if (user.role !== 'admin') {
        // Người dùng thông thường chỉ có thể hủy đơn hàng của chính mình
        if (order.customerId !== user.uid) {
          ctx.status = 403;
          ctx.body = { success: false, message: 'Không có quyền cập nhật đơn hàng này' };
          return;
        }
        
        // Và chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý
        if (status !== orderModel.ORDER_STATUS.CANCELLED) {
          ctx.status = 403;
          ctx.body = { success: false, message: 'Người dùng chỉ có thể hủy đơn hàng' };
          return;
        }
        
        if (order.status !== orderModel.ORDER_STATUS.PENDING) {
          ctx.status = 400;
          ctx.body = { success: false, message: 'Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý' };
          return;
        }
      }
      
      // Kiểm tra trạng thái hợp lệ
      if (!Object.values(orderModel.ORDER_STATUS).includes(status)) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Trạng thái đơn hàng không hợp lệ' };
        return;
      }
      
      // Cập nhật trạng thái
      const updatedOrder = await orderService.updateOrderStatus(orderId, status, user.uid);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: updatedOrder
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy tất cả đơn hàng (cho admin)
   */
  getAllOrders: async (ctx) => {
    try {
      const { user } = ctx.state;
      
      // Kiểm tra quyền admin
      if (!user || user.role !== 'admin') {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền thực hiện thao tác này' };
        return;
      }
      
      const {
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortDirection = 'desc',
        status,
        searchTerm,
        fromDate,
        toDate
      } = ctx.query;
      
      const options = {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        sortBy,
        sortDirection,
        status,
        searchTerm,
        fromDate,
        toDate
      };
      
      const result = await orderService.getAllOrders(options);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Tính toán phí bổ sung cho sản phẩm
   */
  calculateAdditionalFees: async (ctx) => {
    try {
      const { productId } = ctx.params;
      const productOptions = ctx.request.body;
      
      // Lấy thông tin sản phẩm
      const product = await productService.getProduct(productId);
      
      if (!product) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'Sản phẩm không tồn tại' };
        return;
      }
      
      // Kiểm tra xem sản phẩm có yêu cầu phí bổ sung không
      const requiresFees = productModel.requiresAdditionalFees(product.type);
      
      if (requiresFees && (!productOptions || Object.keys(productOptions).length === 0)) {
        ctx.status = 400;
        ctx.body = { 
          success: false, 
          message: 'Sản phẩm này yêu cầu thông tin tùy chỉnh để tính phí',
          requiresCustomOptions: true
        };
        return;
      }
      
      // Tính toán phí bổ sung
      const appliedFees = await orderService.calculateAdditionalFees(product, productOptions);
      
      // Tính tổng phí
      let totalFees = 0;
      for (const fee of appliedFees) {
        totalFees += fee.calculatedAmount;
      }
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          fees: appliedFees,
          totalFees,
          basePrice: product.price,
          totalPrice: product.price + totalFees,
          requiresCustomOptions: requiresFees
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },
  
  /**
   * Kiểm tra đủ số dư để thanh toán đơn hàng
   */
  checkOrderPayment: async (ctx) => {
    try {
      const orderData = ctx.request.body;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Tính toán ước tính tổng tiền đơn hàng
      const estimatedTotal = await orderService.estimateOrderTotal(orderData);
      
      // Kiểm tra số dư
      const hasEnoughCredit = await creditService.checkBalance(user.uid, estimatedTotal);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          hasEnoughCredit,
          estimatedTotal,
          paymentMethod: orderModel.PAYMENT_METHODS.CREDIT
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Tính toán giá đơn hàng trước khi tạo
   */
  calculateOrderPrice: async (ctx) => {
    try {
      const orderData = ctx.request.body;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Tính toán giá đơn hàng
      const priceDetails = await orderService.calculateOrderPrice(orderData);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        priceDetails: priceDetails
      };
    } catch (error) {
      console.error('Error calculating order price:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Lỗi server khi tính giá đơn hàng' };
    }
  }
};

export default orderController; 