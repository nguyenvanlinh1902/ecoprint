const orderRepository = require('./order.repository');
const productRepository = require('./product.repository');
const userRepository = require('./user.repository');

// Make sure Firebase is initialized before requiring these modules
// This will now be handled in the main index.js file

/**
 * Repository factory
 * Returns the repository instance for a given entity type
 * 
 * @param {string} type - Entity type to get repository for
 * @returns {Object} Repository instance
 */
exports.getRepository = (type) => {
  switch (type.toLowerCase()) {
    case 'order':
      return orderRepository;
    case 'product':
      return productRepository;
    case 'user':
      return userRepository;
    default:
      throw new Error(`Unknown repository type: ${type}`);
  }
}; 