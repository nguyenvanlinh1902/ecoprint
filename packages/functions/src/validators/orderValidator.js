/**
 * Validation cho các yêu cầu liên quan đến đơn hàng
 */
import Joi from 'joi';

/**
 * Schema cho địa chỉ giao hàng
 */
const shippingAddressSchema = Joi.object({
  street: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập địa chỉ đường phố',
    'any.required': 'Địa chỉ đường phố là bắt buộc'
  }),
  city: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập thành phố',
    'any.required': 'Thành phố là bắt buộc'
  }),
  state: Joi.string().allow('', null),
  postalCode: Joi.string().required().messages({
    'string.empty': 'Vui lòng nhập mã bưu điện',
    'any.required': 'Mã bưu điện là bắt buộc'
  }),
  country: Joi.string().default('Vietnam')
});

/**
 * Schema cho customization
 */
const customizationSchema = Joi.object({
  type: Joi.string().valid('print', 'embroidery', 'dtg', 'dtf').required().messages({
    'string.empty': 'Vui lòng chọn loại tùy chỉnh',
    'any.required': 'Loại tùy chỉnh là bắt buộc',
    'any.only': 'Loại tùy chỉnh không hợp lệ'
  }),
  location: Joi.string().required().messages({
    'string.empty': 'Vui lòng chọn vị trí in/thêu',
    'any.required': 'Vị trí in/thêu là bắt buộc'
  }),
  fileUrl: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

/**
 * Schema cho line item
 */
const lineItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    'string.empty': 'Vui lòng chọn sản phẩm',
    'any.required': 'Sản phẩm là bắt buộc'
  }),
  variantId: Joi.string().allow('', null),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Số lượng phải là số',
    'number.integer': 'Số lượng phải là số nguyên',
    'number.min': 'Số lượng phải lớn hơn 0',
    'any.required': 'Số lượng là bắt buộc'
  }),
  customizations: Joi.array().items(customizationSchema).default([])
});

/**
 * Schema cho tạo đơn hàng
 */
const createOrderSchema = Joi.object({
  shippingAddress: Joi.when('hasPhysicalProducts', {
    is: true,
    then: shippingAddressSchema.required().messages({
      'any.required': 'Địa chỉ giao hàng là bắt buộc với sản phẩm vật lý'
    }),
    otherwise: Joi.object().allow(null)
  }),
  lineItems: Joi.array().items(lineItemSchema).min(1).required().messages({
    'array.min': 'Đơn hàng phải có ít nhất một sản phẩm',
    'any.required': 'Danh sách sản phẩm là bắt buộc'
  }),
  note: Joi.string().allow('', null),
  hasPhysicalProducts: Joi.boolean().default(false)
});

/**
 * Middleware validate tạo đơn hàng
 */
export const validateCreateOrder = async (ctx, next) => {
  try {
    // Kiểm tra xem có sản phẩm vật lý không
    const orderData = ctx.request.body;
    let hasPhysicalProducts = false;
    
    if (orderData.lineItems && Array.isArray(orderData.lineItems)) {
      for (const item of orderData.lineItems) {
        // Kiểm tra sản phẩm có phải là digital không
        if (item.productId) {
          const productRef = await ctx.app.firestore.collection('products').doc(item.productId).get();
          if (productRef.exists) {
            const productData = productRef.data();
            if (productData.type !== 'digital') {
              hasPhysicalProducts = true;
              break;
            }
          }
        }
      }
    }
    
    // Thêm thông tin hasPhysicalProducts vào dữ liệu
    orderData.hasPhysicalProducts = hasPhysicalProducts;
    
    // Validate order
    const { error, value } = createOrderSchema.validate(orderData, { abortEarly: false });
    
    if (error) {
      ctx.status = 400;
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      ctx.body = { success: false, message: 'Dữ liệu không hợp lệ', details };
      return;
    }
    
    // Gán dữ liệu đã validate vào request
    ctx.request.body = value;
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { success: false, message: err.message };
  }
};

/**
 * Middleware validate cập nhật đơn hàng
 */
export const validateUpdateOrder = async (ctx, next) => {
  // Tạo sau khi cần
  await next();
}; 