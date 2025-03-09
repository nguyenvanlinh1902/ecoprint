/**
 * Service xử lý đơn hàng
 */
import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';
import creditService from './creditService.js';
import transactionModel from '../models/transactionModel.js';

const orderService = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng đã tạo
   */
  createOrder: async (orderData) => {
    try {
      // Đảm bảo phương thức thanh toán là credit
      orderData.paymentMethod = orderModel.PAYMENT_METHODS.CREDIT;
      
      // Validate đơn hàng
      const { isValid, errors } = orderModel.validateOrder(orderData);
      if (!isValid) {
        throw new Error(`Dữ liệu đơn hàng không hợp lệ: ${errors.join(', ')}`);
      }
      
      // Tạo ID đơn hàng
      const timestamp = new Date();
      const orderId = `ECO-${Date.now().toString().slice(-6)}`;
      
      // Tính tổng tiền và xử lý các mặt hàng
      let subtotal = 0;
      let total = 0;
      
      // Tính toán tổng tiền của các mặt hàng
      for (const item of orderData.items) {
        const itemTotal = orderModel.calculateItemTotal(item);
        subtotal += itemTotal;
      }
      
      // Tính tổng tiền với phí bổ sung (nếu có)
      total = subtotal;
      if (orderData.additionalCharges && Array.isArray(orderData.additionalCharges)) {
        for (const charge of orderData.additionalCharges) {
          total += charge.amount;
        }
      }
      
      // Kiểm tra số dư tài khoản credit
      const hasEnoughBalance = await creditService.checkBalance(orderData.customerId, total);
      if (!hasEnoughBalance) {
        throw new Error('Số dư tài khoản không đủ để thanh toán đơn hàng');
      }
      
      // Tạo giao dịch thanh toán từ credit
      await creditService.createTransaction({
        customerId: orderData.customerId,
        customer: {
          name: orderData.customerName,
          email: orderData.customerEmail
        },
        type: transactionModel.TRANSACTION_TYPES.PURCHASE,
        amount: total,
        reference: `Order ${orderId}`,
        orderId: orderId,
        status: transactionModel.TRANSACTION_STATUS.APPROVED
      });
      
      // Tạo đơn hàng mới
      const newOrder = {
        ...orderData,
        id: orderId,
        date: timestamp.toISOString().split('T')[0],
        subtotal,
        total,
        status: orderModel.ORDER_STATUS.PENDING,
        createdAt: timestamp
      };
      
      // Lưu đơn hàng vào database
      await db.collection('orders').doc(orderId).set(newOrder);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Ước tính tổng tiền đơn hàng trước khi tạo
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<number>} Tổng tiền ước tính
   */
  estimateOrderTotal: async (orderData) => {
    try {
      let subtotal = 0;
      
      // Tính toán tổng tiền của các mặt hàng
      if (orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          if (item.appliedFees && Array.isArray(item.appliedFees)) {
            const itemTotal = orderModel.calculateItemTotal(item);
            subtotal += itemTotal;
          } else {
            // Nếu chưa có phí bổ sung, tính dựa trên giá cơ bản
            subtotal += item.price * item.quantity;
          }
        }
      }
      
      // Tính tổng tiền với phí bổ sung (nếu có)
      let total = subtotal;
      if (orderData.additionalCharges && Array.isArray(orderData.additionalCharges)) {
        for (const charge of orderData.additionalCharges) {
          total += charge.amount;
        }
      }
      
      return total;
    } catch (error) {
      console.error('Error estimating order total:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise<Object>} Thông tin đơn hàng
   */
  getOrder: async (orderId) => {
    try {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists) {
        throw new Error('Đơn hàng không tồn tại');
      }
      
      return {
        id: orderDoc.id,
        ...orderDoc.data()
      };
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @param {string} customerId - ID của khách hàng
   * @param {number} [limit=10] - Số lượng đơn hàng tối đa
   * @param {number} [offset=0] - Vị trí bắt đầu
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  getCustomerOrders: async (customerId, limit = 10, offset = 0) => {
    try {
      const ordersSnapshot = await db.collection('orders')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      const orders = [];
      ordersSnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return orders;
    } catch (error) {
      console.error('Error getting customer orders:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @param {string} status - Trạng thái mới
   * @param {string} [updatedBy] - ID người cập nhật
   * @returns {Promise<Object>} Thông tin đơn hàng đã cập nhật
   */
  updateOrderStatus: async (orderId, status, updatedBy = null) => {
    try {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists) {
        throw new Error('Đơn hàng không tồn tại');
      }
      
      const order = orderDoc.data();
      
      // Kiểm tra trạng thái hợp lệ
      if (!Object.values(orderModel.ORDER_STATUS).includes(status)) {
        throw new Error('Trạng thái đơn hàng không hợp lệ');
      }
      
      // Không cho phép cập nhật nếu đơn hàng đã hoàn thành hoặc đã hủy
      if (
        order.status === orderModel.ORDER_STATUS.COMPLETED ||
        order.status === orderModel.ORDER_STATUS.CANCELLED
      ) {
        throw new Error('Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy');
      }
      
      // Xử lý hoàn tiền nếu đơn hàng bị hủy và đã thanh toán bằng credit
      if (
        status === orderModel.ORDER_STATUS.CANCELLED && 
        order.paymentMethod === orderModel.PAYMENT_METHODS.CREDIT &&
        order.status !== orderModel.ORDER_STATUS.CANCELLED
      ) {
        // Tạo giao dịch hoàn tiền
        await creditService.createTransaction({
          customerId: order.customerId,
          customer: {
            name: order.customerName,
            email: order.customerEmail
          },
          type: transactionModel.TRANSACTION_TYPES.REFUND,
          amount: order.total,
          reference: `Refund Order ${orderId}`,
          orderId: orderId,
          status: transactionModel.TRANSACTION_STATUS.APPROVED
        });
      }
      
      const updateData = {
        status,
        updatedAt: new Date()
      };
      
      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }
      
      await orderRef.update(updateData);
      
      return {
        ...order,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Tính toán phí bổ sung cho mặt hàng
   * @param {Object} product - Thông tin sản phẩm
   * @param {Object} productOptions - Tùy chọn sản phẩm
   * @returns {Promise<Array>} Danh sách phí đã tính toán
   */
  calculateAdditionalFees: async (product, productOptions = {}) => {
    try {
      if (!product.additionalFees || !Array.isArray(product.additionalFees)) {
        return [];
      }
      
      const appliedFees = [];
      
      // Lọc và tính toán phí bổ sung
      for (const fee of product.additionalFees) {
        // Kiểm tra xem phí có áp dụng cho loại sản phẩm không
        if (fee.applicableProductType !== product.type) {
          continue;
        }
        
        // Kiểm tra xem phí có bắt buộc hay không
        if (!fee.isRequired && (!productOptions.selectedFees || !productOptions.selectedFees.includes(fee.id))) {
          continue;
        }
        
        // Tính giá trị phí
        let calculatedAmount = 0;
        if (fee.isPercentage) {
          calculatedAmount = (product.price * fee.amount) / 100;
        } else {
          calculatedAmount = fee.amount;
        }
        
        appliedFees.push({
          id: fee.id,
          name: fee.name,
          amount: fee.amount,
          isPercentage: fee.isPercentage,
          calculatedAmount
        });
      }
      
      // Phí bắt buộc cho dịch vụ tùy chỉnh và in ấn
      const isServiceProduct = 
        product.type === productModel.PRODUCT_TYPES.CUSTOM || 
        product.type === productModel.PRODUCT_TYPES.DTF_PRINTING || 
        product.type === productModel.PRODUCT_TYPES.DTG_PRINTING;
      
      if (isServiceProduct) {
        // Thêm phí bắt buộc cho dịch vụ
        // ...
      }
      
      return appliedFees;
    } catch (error) {
      console.error('Error calculating additional fees:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả đơn hàng với phân trang và tìm kiếm
   * @param {Object} options - Tùy chọn tìm kiếm và phân trang
   * @returns {Promise<Object>} Kết quả tìm kiếm đơn hàng
   */
  getAllOrders: async (options = {}) => {
    try {
      const {
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortDirection = 'desc',
        status = null,
        searchTerm = null,
        fromDate = null,
        toDate = null
      } = options;
      
      let query = db.collection('orders');
      
      // Lọc theo trạng thái
      if (status) {
        query = query.where('status', '==', status);
      }
      
      // Lọc theo ngày
      if (fromDate && toDate) {
        query = query.where('createdAt', '>=', new Date(fromDate))
                     .where('createdAt', '<=', new Date(toDate));
      } else if (fromDate) {
        query = query.where('createdAt', '>=', new Date(fromDate));
      } else if (toDate) {
        query = query.where('createdAt', '<=', new Date(toDate));
      }
      
      // Sắp xếp
      query = query.orderBy(sortBy, sortDirection);
      
      // Lấy tổng số đơn hàng (cho phân trang)
      const countSnapshot = await query.get();
      const totalOrders = countSnapshot.size;
      
      // Áp dụng phân trang
      query = query.limit(limit).offset(offset);
      
      // Thực hiện truy vấn
      const ordersSnapshot = await query.get();
      
      const orders = [];
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data();
        
        // Lọc theo từ khóa tìm kiếm (thực hiện ở client vì Firestore không hỗ trợ tìm kiếm text)
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            orderData.id.toLowerCase().includes(searchLower) ||
            orderData.customerName.toLowerCase().includes(searchLower) ||
            orderData.customerEmail.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) {
            return;
          }
        }
        
        orders.push({
          id: doc.id,
          ...orderData
        });
      });
      
      return {
        orders,
        total: totalOrders,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  /**
   * Tính toán chi tiết giá đơn hàng
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Object} Chi tiết giá
   */
  calculateOrderPrice: async (orderData) => {
    const { lineItems } = orderData;
    
    let subtotal = 0;
    let total = 0;
    let shippingFee = 0;
    
    // Chi tiết các sản phẩm
    const itemDetails = [];
    
    // Xử lý từng sản phẩm
    for (const item of lineItems) {
      const { productId, variantId, quantity, customizations = [] } = item;
      
      // Lấy thông tin sản phẩm
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        throw new Error(`Sản phẩm không tồn tại: ${productId}`);
      }
      
      const product = productDoc.data();
      
      // Lấy thông tin variant
      let variant = null;
      let variantPrice = 0;
      
      if (variantId) {
        const variantDoc = await db.collection('products')
          .doc(productId)
          .collection('variants')
          .doc(variantId)
          .get();
        
        if (variantDoc.exists) {
          variant = variantDoc.data();
          variantPrice = variant.price;
        }
      } else {
        // Lấy variant mặc định nếu có
        const variantsSnapshot = await db.collection('products')
          .doc(productId)
          .collection('variants')
          .limit(1)
          .get();
        
        if (!variantsSnapshot.empty) {
          variant = variantsSnapshot.docs[0].data();
          variantPrice = variant.price;
        }
      }
      
      // Tính giá cơ bản cho sản phẩm
      const basePrice = variantPrice > 0 ? variantPrice : (product.price || 0);
      const itemSubtotal = basePrice * quantity;
      
      // Tính phí bổ sung cho các customization
      let customizationFees = 0;
      const customizationDetails = [];
      
      for (const customization of customizations) {
        const { type, location } = customization;
        
        // Lấy giá cho loại customization và vị trí
        const feeDoc = await db.collection('pricingRules')
          .where('type', '==', type)
          .where('location', '==', location)
          .limit(1)
          .get();
        
        let fee = 0;
        
        if (!feeDoc.empty) {
          const feeData = feeDoc.docs[0].data();
          fee = feeData.price || 0;
        } else {
          // Giá mặc định dựa trên loại và vị trí
          if (type === 'embroidery') {
            if (location === 'large_center') fee = 4.00;
            else if (location === 'left_sleeve' || location === 'right_sleeve') fee = 1.00;
            else if (location === 'back_location') fee = 4.00;
            else if (location === 'special_location') fee = 4.00;
          } else if (type === 'dtg' || type === 'dtf') {
            fee = 1.00;
          }
        }
        
        customizationFees += fee;
        customizationDetails.push({
          type,
          location,
          fee
        });
      }
      
      // Phí xử lý file
      let processingFee = 0;
      if (customizations.length > 0) {
        const hasDTG = customizations.some(c => c.type === 'dtg');
        const hasDTF = customizations.some(c => c.type === 'dtf');
        const hasEmbroidery = customizations.some(c => c.type === 'embroidery');
        
        if (hasEmbroidery) processingFee += 3.00; // EMB file
        if (hasDTG) processingFee += 1.00; // DTG Printing
        if (hasDTF) processingFee += 2.00; // Printing file
      }
      
      // Tổng phí cho sản phẩm
      const itemTotal = itemSubtotal + customizationFees + processingFee;
      
      // Thêm vào danh sách chi tiết
      itemDetails.push({
        productId,
        productName: product.title,
        variantId: variant ? variant.id : null,
        variantName: variant ? `${variant.option1Name}: ${variant.option1Value}` : null,
        quantity,
        basePrice,
        itemSubtotal,
        customizationFees,
        processingFee,
        customizationDetails,
        itemTotal
      });
      
      // Cộng vào tổng
      subtotal += itemTotal;
    }
    
    // Tính phí vận chuyển
    if (orderData.hasPhysicalProducts && orderData.shippingAddress) {
      // Giả sử phí vận chuyển cố định
      shippingFee = 5.00;
      
      // Trong thực tế, bạn có thể tính phí vận chuyển dựa trên địa chỉ, trọng lượng, v.v.
    }
    
    // Tổng giá
    total = subtotal + shippingFee;
    
    return {
      subtotal,
      shippingFee,
      total,
      itemDetails
    };
  }
};

export default orderService; 