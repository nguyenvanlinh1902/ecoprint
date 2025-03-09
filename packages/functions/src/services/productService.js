/**
 * Service xử lý các logic liên quan đến sản phẩm
 */
import fs from 'fs';
import { parse } from 'csv-parse';
import { firestore, storage } from '../utils/firebase.js';
import productModel from '../models/productModel.js';
import { v4 as uuidv4 } from 'uuid';

const productService = {
  /**
   * Xử lý file import sản phẩm
   * @param {string} filePath - Đường dẫn tới file CSV
   * @param {string} importId - ID của bản ghi import
   * @param {boolean} updateExisting - Có cập nhật sản phẩm đã tồn tại không
   */
  processImportFile: async (filePath, importId, updateExisting) => {
    try {
      // Đọc file CSV
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse CSV
      const records = await new Promise((resolve, reject) => {
        parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });
      
      // Cập nhật số lượng items
      await firestore.collection('productImports').doc(importId).update({
        totalItems: records.length
      });
      
      // Xử lý từng sản phẩm
      let successCount = 0;
      let failedCount = 0;
      let errors = [];
      
      for (let i = 0; i < records.length; i++) {
        try {
          const record = records[i];
          
          // Kiểm tra sản phẩm đã tồn tại chưa
          const existingProduct = await firestore.collection('products')
            .where('handle', '==', record.Handle)
            .limit(1)
            .get();
          
          let productId;
          
          // Xử lý cập nhật hoặc thêm mới
          if (!existingProduct.empty) {
            const existingDoc = existingProduct.docs[0];
            productId = existingDoc.id;
            
            if (updateExisting) {
              // Cập nhật sản phẩm
              await firestore.collection('products').doc(productId).update({
                title: record.Title,
                bodyHtml: record['Body (HTML)'],
                vendor: record.Vendor,
                productCategory: record['Product Category'],
                type: record.Type,
                tags: record.Tags ? record.Tags.split(',').map(tag => tag.trim()) : [],
                published: record.Published.toLowerCase() === 'true',
                updatedAt: new Date()
              });
              
              // Xử lý variants nếu có
              if (record['Option1 Name'] && record['Option1 Value']) {
                // Kiểm tra variant đã tồn tại chưa
                const variantSnapshot = await firestore.collection('products').doc(productId)
                  .collection('variants')
                  .where('option1Value', '==', record['Option1 Value'])
                  .get();
                
                if (!variantSnapshot.empty) {
                  // Cập nhật variant
                  const variantId = variantSnapshot.docs[0].id;
                  await firestore.collection('products').doc(productId)
                    .collection('variants').doc(variantId).update({
                      sku: record['Variant SKU'] || '',
                      price: parseFloat(record['Variant Price']) || 0,
                      compareAtPrice: record['Variant Compare At Price'] ? parseFloat(record['Variant Compare At Price']) : null,
                      inventoryQuantity: parseInt(record['Variant Inventory Qty']) || 0,
                      updatedAt: new Date()
                    });
                } else {
                  // Thêm variant mới
                  await firestore.collection('products').doc(productId)
                    .collection('variants').add({
                      option1Name: record['Option1 Name'],
                      option1Value: record['Option1 Value'],
                      option2Name: record['Option2 Name'] || null,
                      option2Value: record['Option2 Value'] || null,
                      option3Name: record['Option3 Name'] || null,
                      option3Value: record['Option3 Value'] || null,
                      sku: record['Variant SKU'] || '',
                      price: parseFloat(record['Variant Price']) || 0,
                      compareAtPrice: record['Variant Compare At Price'] ? parseFloat(record['Variant Compare At Price']) : null,
                      inventoryQuantity: parseInt(record['Variant Inventory Qty']) || 0,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    });
                }
              }
            }
          } else {
            // Thêm sản phẩm mới
            productId = uuidv4();
            await firestore.collection('products').doc(productId).set({
              id: productId,
              handle: record.Handle,
              title: record.Title,
              bodyHtml: record['Body (HTML)'],
              vendor: record.Vendor,
              productCategory: record['Product Category'],
              type: record.Type,
              tags: record.Tags ? record.Tags.split(',').map(tag => tag.trim()) : [],
              published: record.Published.toLowerCase() === 'true',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            // Thêm variant mới
            if (record['Option1 Name'] && record['Option1 Value']) {
              await firestore.collection('products').doc(productId)
                .collection('variants').add({
                  option1Name: record['Option1 Name'],
                  option1Value: record['Option1 Value'],
                  option2Name: record['Option2 Name'] || null,
                  option2Value: record['Option2 Value'] || null,
                  option3Name: record['Option3 Name'] || null,
                  option3Value: record['Option3 Value'] || null,
                  sku: record['Variant SKU'] || '',
                  price: parseFloat(record['Variant Price']) || 0,
                  compareAtPrice: record['Variant Compare At Price'] ? parseFloat(record['Variant Compare At Price']) : null,
                  inventoryQuantity: parseInt(record['Variant Inventory Qty']) || 0,
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
            }
          }
          
          // Xử lý hình ảnh nếu có
          if (record['Image Src']) {
            // Code xử lý hình ảnh sẽ được thêm sau
            // Cần tải hình ảnh từ URL và lưu vào storage
          }
          
          successCount++;
        } catch (error) {
          console.error(`Error processing product at row ${i + 2}:`, error);
          failedCount++;
          errors.push({
            row: i + 2, // +2 vì dòng đầu tiên là header và index bắt đầu từ 0
            message: error.message
          });
        }
        
        // Cập nhật tiến trình
        await firestore.collection('productImports').doc(importId).update({
          processedItems: i + 1,
          successItems: successCount,
          failedItems: failedCount,
          errors: errors
        });
      }
      
      // Kết thúc import
      await firestore.collection('productImports').doc(importId).update({
        status: 'completed',
        completedAt: new Date()
      });
      
      // Xóa file tạm
      fs.unlinkSync(filePath);
      
    } catch (error) {
      console.error('Error processing import file:', error);
      
      // Đánh dấu import thất bại
      await firestore.collection('productImports').doc(importId).update({
        status: 'failed',
        completedAt: new Date(),
        error: error.message
      });
      
      // Xóa file tạm nếu có
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.error('Error removing temp file:', e);
      }
    }
  },
  
  /**
   * Lấy đường dẫn đến template import
   */
  getImportTemplateUrl: async () => {
    // URL đến template import
    // Trong thực tế, bạn có thể upload template lên storage và lấy URL
    return 'https://storage.googleapis.com/ecoprint-assets/templates/product_import_template.csv';
  },
  
  /**
   * Lấy trạng thái import
   * @param {string} importId - ID của bản ghi import
   */
  getImportStatus: async (importId) => {
    const importDoc = await firestore.collection('productImports').doc(importId).get();
    
    if (!importDoc.exists) {
      return null;
    }
    
    return importDoc.data();
  }
};

export default productService; 