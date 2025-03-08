import * as yup from 'yup';

/**
 * Validator cho request xác thực người dùng
 */
export const validateVerifyRequest = async (data) => {
  // Define schema
  const schema = yup.object().shape({
    approve: yup.boolean().required('Approve status is required'),
    rejectionReason: yup.string().when('approve', {
      is: false,
      then: yup.string().required('Rejection reason is required when rejecting a user'),
      otherwise: yup.string().notRequired()
    })
  });

  try {
    // Validate and return validated data
    const validData = await schema.validate(data, { abortEarly: false });
    return { value: validData };
  } catch (error) {
    // Format yup errors to match Joi format (for backward compatibility)
    return {
      error: {
        details: error.inner.map(err => ({
          message: err.message,
          path: err.path
        }))
      }
    };
  }
};

/**
 * Validator cho các tham số phân trang và tìm kiếm
 */
export const validatePaginationParams = async (data) => {
  // Define schema
  const schema = yup.object().shape({
    page: yup.number().integer().min(1).default(1)
      .transform(value => isNaN(value) ? 1 : value),
    limit: yup.number().integer().min(1).max(100).default(10)
      .transform(value => isNaN(value) ? 10 : value),
    sortBy: yup.string().oneOf(['createdAt', 'email', 'fullName']).default('createdAt'),
    sortOrder: yup.string().oneOf(['asc', 'desc']).default('desc'),
    status: yup.string().oneOf(['all', 'pending', 'verified']).default('all'),
    search: yup.string().default('')
  });

  try {
    // Validate and return validated data with defaults applied
    const validData = await schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true // Remove unknown fields
    });
    return { value: validData };
  } catch (error) {
    // Format yup errors to match Joi format
    return {
      error: {
        details: error.inner.map(err => ({
          message: err.message,
          path: err.path
        }))
      }
    };
  }
};

/**
 * Middleware để validate yêu cầu
 * @param {Function} validator - Hàm validator
 * @param {String} source - Nguồn dữ liệu (body, query, params)
 */
export const validate = (validator, source = 'body') => {
  return async (ctx, next) => {
    try {
      // Select the source data from the request
      let data;
      switch(source) {
        case 'body':
          data = ctx.request.body;
          break;
        case 'query':
          data = ctx.request.query;
          break;
        case 'params':
          data = ctx.params;
          break;
        default:
          data = ctx.request.body;
      }

      // Validate the data
      const { error, value } = await validator(data);
      
      if (error) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Validation error',
          errors: error.details.map(err => ({
            message: err.message,
            path: err.path
          }))
        };
        return;
      }
      
      // Add validated data to context state
      ctx.state.validatedData = value;
      await next();
    } catch (err) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Validation error',
        error: err.message
      };
    }
  };
}; 