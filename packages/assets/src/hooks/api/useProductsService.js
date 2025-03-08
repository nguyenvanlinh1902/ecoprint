import { useState } from 'react';

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Recycled A4 Paper (500 sheets)',
    category: 'Printing Paper',
    price: 5.99,
    rating: 4.5,
    image: '/products/recycled-paper.jpg',
    description: 'Eco-friendly recycled A4 paper for everyday printing. 80gsm.',
    inStock: true,
    stockQuantity: 1500,
    eco: true,
    featured: true
  },
  {
    id: 2,
    name: 'Premium Kraft Paper Bags',
    category: 'Packaging Materials',
    price: 3.49,
    rating: 4.2,
    image: '/products/kraft-bags.jpg',
    description: 'Durable kraft paper bags for packaging. 100% recyclable.',
    inStock: true,
    stockQuantity: 750,
    eco: true,
    featured: false
  },
  {
    id: 3,
    name: 'Bamboo Notebooks',
    category: 'Office Supplies',
    price: 7.99,
    rating: 4.8,
    image: '/products/bamboo-notebook.jpg',
    description: 'Sustainable bamboo cover notebooks with recycled paper. Perfect for eco-conscious note-taking.',
    inStock: true,
    stockQuantity: 200,
    eco: true,
    featured: true
  },
  {
    id: 4,
    name: 'Recycled Cardboard Boxes (Pack of 10)',
    category: 'Packaging Materials',
    price: 12.99,
    rating: 4.0,
    image: '/products/cardboard-boxes.jpg',
    description: 'Strong recycled cardboard boxes for shipping and storage.',
    inStock: true,
    stockQuantity: 350,
    eco: true,
    featured: false
  },
  {
    id: 5,
    name: 'Eco-Friendly Gloss Paper',
    category: 'Specialty Paper',
    price: 8.99,
    rating: 4.3,
    image: '/products/gloss-paper.jpg',
    description: 'High-quality glossy paper made from sustainable sources. Perfect for brochures and presentations.',
    inStock: true,
    stockQuantity: 600,
    eco: true,
    featured: true
  }
];

/**
 * Custom hook for managing product data
 * 
 * @returns {Object} Product service methods
 */
export const useProductsService = () => {
  // In a real app, this would make API calls
  // For now, we'll simulate API calls with timeouts

  /**
   * Fetch all products
   * 
   * @returns {Promise<Array>} Promise resolving to array of products
   */
  const fetchProducts = () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(MOCK_PRODUCTS);
      }, 800);
    });
  };

  /**
   * Fetch a single product by ID
   * 
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Promise resolving to product object
   */
  const fetchProductById = (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        if (product) {
          resolve(product);
        } else {
          reject(new Error('Product not found'));
        }
      }, 300);
    });
  };

  /**
   * Update an existing product
   * 
   * @param {Object} updatedProduct - Updated product data
   * @returns {Promise<Object>} Promise resolving to updated product
   */
  const updateProduct = (updatedProduct) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would call an API endpoint
        resolve(updatedProduct);
      }, 500);
    });
  };

  /**
   * Delete a product
   * 
   * @param {number} productId - ID of product to delete
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  const deleteProduct = (productId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would call an API endpoint
        resolve(true);
      }, 500);
    });
  };

  return {
    fetchProducts,
    fetchProductById,
    updateProduct,
    deleteProduct
  };
};

export default useProductsService; 