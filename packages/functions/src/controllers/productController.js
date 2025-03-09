/**
 * Controller xử lý các yêu cầu liên quan đến sản phẩm
 */
import productService from '../services/productService.js';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from '../utils/firebase.js';

const productController = {
  /**
   * Import sản phẩm từ file CSV
   */
  importProducts: async (ctx) => {
    try {
      // Kiểm tra quyền admin
      const { user } = ctx.state;
      if (!user || !user.isAdmin) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền thực hiện thao tác này' };
        return;
      }

      // Xử lý file upload
      const { file } = ctx.request.files;
      if (!file) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Vui lòng upload file CSV' };
        return;
      }

      // Kiểm tra định dạng file
      const fileExt = path.extname(file.name).toLowerCase();
      if (fileExt !== '.csv') {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Chỉ hỗ trợ file định dạng CSV' };
        return;
      }

      // Lấy các tùy chọn import
      const { updateExisting = false } = ctx.request.body;

      // Tạo bản ghi import mới
      const importId = uuidv4();
      const importRecord = {
        id: importId,
        userId: user.uid,
        fileName: file.name,
        status: 'processing',
        totalItems: 0,
        processedItems: 0,
        successItems: 0,
        failedItems: 0,
        errors: [],
        createdAt: new Date(),
        completedAt: null
      };

      // Lưu bản ghi import
      await firestore.collection('productImports').doc(importId).set(importRecord);

      // Tạo job xử lý import (async)
      productService.processImportFile(file.path, importId, updateExisting);

      ctx.status = 202;
      ctx.body = {
        success: true,
        message: 'Bắt đầu xử lý import sản phẩm',
        importId: importId
      };
    } catch (error) {
      console.error('Error importing products:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Lỗi server khi xử lý import sản phẩm' };
    }
  },

  /**
   * Lấy template file import
   */
  getImportTemplate: async (ctx) => {
    try {
      // Đường dẫn đến file template
      const templateUrl = await productService.getImportTemplateUrl();
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        templateUrl: templateUrl
      };
    } catch (error) {
      console.error('Error getting import template:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Lỗi server khi lấy template import' };
    }
  },

  /**
   * Kiểm tra trạng thái import
   */
  getImportStatus: async (ctx) => {
    try {
      const { importId } = ctx.params;
      const { user } = ctx.state;

      // Kiểm tra quyền admin
      if (!user || !user.isAdmin) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền thực hiện thao tác này' };
        return;
      }

      // Lấy thông tin import
      const importStatus = await productService.getImportStatus(importId);
      
      if (!importStatus) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'Không tìm thấy thông tin import' };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        success: true,
        importStatus: importStatus
      };
    } catch (error) {
      console.error('Error getting import status:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Lỗi server khi kiểm tra trạng thái import' };
    }
  }
};

export default productController; 