import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Service xử lý thao tác với Firebase Storage
 */
const storageService = {
  /**
   * Kiểm tra xem Firebase Storage có sẵn sàng và người dùng có quyền truy cập không
   * @returns {Promise<boolean>} True nếu storage có thể truy cập
   */
  checkStorageAccess: async () => {
    try {
      // Tạo một test file nhỏ
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      
      // Thử upload đến một đường dẫn tạm
      const testRef = ref(storage, '_test_access_' + Date.now());
      
      // Thử upload
      console.log('Kiểm tra quyền Storage bằng cách upload test file');
      await uploadBytes(testRef, testBlob);
      
      // Lấy URL để xác nhận upload thành công
      const url = await getDownloadURL(testRef);
      console.log('Storage access check passed, URL:', url);
      
      return true;
    } catch (error) {
      console.error('Không thể truy cập Firebase Storage:', error);
      
      let errorMessage = 'Không thể kết nối đến storage.';
      
      // Phân tích các mã lỗi phổ biến
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'Không có quyền truy cập vào storage. Vui lòng kiểm tra quy tắc bảo mật.';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload bị hủy.';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Vượt quá giới hạn lưu trữ.';
            break;
          case 'storage/invalid-url':
            errorMessage = 'URL không hợp lệ.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Phương thức xác thực chưa được bật trên Firebase Console.';
            break;
          default:
            errorMessage = `Lỗi storage: ${error.code} - ${error.message}`;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Upload file lên Firebase Storage với cơ chế retry và theo dõi tiến trình
   * @param {string} path Đường dẫn đến thư mục lưu trữ trên Firebase Storage
   * @param {File} file File cần upload
   * @param {Function} onProgress Callback theo dõi tiến trình (nhận giá trị từ 0-100)
   * @param {Function} onError Callback khi xảy ra lỗi
   * @param {number} maxRetries Số lần thử lại tối đa
   * @returns {Promise<string>} URL của file sau khi upload thành công
   */
  uploadFile: async (path, file, onProgress, onError, maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
      let currentRetry = 0;
      
      const attemptUpload = async () => {
        try {
          // Tạo storage reference
          const storageRef = ref(storage, path);
          
          // Nếu không cần theo dõi tiến trình, dùng uploadBytes đơn giản
          if (!onProgress) {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            resolve(downloadURL);
            return;
          }
          
          // Sử dụng uploadBytesResumable để theo dõi tiến trình
          const uploadTask = uploadBytesResumable(storageRef, file);
          
          // Lắng nghe sự kiện theo dõi tiến trình
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              if (onProgress) onProgress(progress);
            },
            (error) => {
              // Xử lý lỗi trong quá trình upload
              console.error('Upload error:', error);
              
              // Gọi callback lỗi nếu được cung cấp
              if (onError) onError(error);
              
              // Thử lại nếu chưa vượt quá số lần thử
              if (currentRetry < maxRetries) {
                currentRetry++;
                console.log(`Retry attempt ${currentRetry} of ${maxRetries}`);
                setTimeout(attemptUpload, 1500 * currentRetry); // Tăng thời gian chờ giữa các lần thử
              } else {
                reject(new Error(`Upload failed after ${maxRetries} retries`));
              }
            },
            async () => {
              // Upload hoàn thành
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
              } catch (err) {
                if (onError) onError(err);
                reject(err);
              }
            }
          );
        } catch (error) {
          console.error('Upload setup error:', error);
          
          // Thử lại nếu chưa vượt quá số lần thử
          if (currentRetry < maxRetries) {
            currentRetry++;
            console.log(`Retry setup attempt ${currentRetry} of ${maxRetries}`);
            setTimeout(attemptUpload, 1500 * currentRetry);
          } else {
            if (onError) onError(error);
            reject(error);
          }
        }
      };
      
      // Bắt đầu thử upload
      attemptUpload();
    });
  },
  
  /**
   * Upload ảnh lên Firebase Storage (phiên bản rút gọn cho ảnh)
   * @param {string} path Đường dẫn trên Firebase Storage
   * @param {File} imageFile File ảnh cần upload
   * @param {Function} onProgress Callback theo dõi tiến trình (nhận giá trị từ 0-100)
   * @param {Function} onError Callback khi xảy ra lỗi
   * @returns {Promise<string>} URL của ảnh sau khi upload
   */
  uploadImage: async (path, imageFile, onProgress, onError) => {
    try {
      console.log(`Starting image upload for ${path}, file size: ${Math.round(imageFile.size / 1024)}KB`);
      
      // Kiểm tra kiểu file
      if (!imageFile.type.startsWith('image/')) {
        const error = new Error('Tệp không phải là hình ảnh');
        if (onError) onError(error);
        throw error;
      }
      
      // Giảm kích thước ảnh nếu quá lớn (> 1MB)
      let fileToUpload = imageFile;
      if (imageFile.size > 1024 * 1024) {
        try {
          console.log('File lớn hơn 1MB, tiến hành nén...');
          fileToUpload = await storageService.compressImage(imageFile, 800);
          console.log(`Nén thành công, kích thước mới: ${Math.round(fileToUpload.size / 1024)}KB`);
        } catch (error) {
          console.warn('Không thể nén ảnh:', error);
          // Tiếp tục với file gốc nếu không thể nén
        }
      }
      
      // Đảm bảo path không có dấu cách hoặc ký tự đặc biệt
      const safePath = path.replace(/[^a-z0-9\/._-]/gi, '_');
      if (safePath !== path) {
        console.log(`Path đã được chuẩn hóa: ${path} -> ${safePath}`);
      }
      
      // Thêm timestamp vào tên file để tránh trùng lặp
      const timestamp = new Date().getTime();
      const finalPath = `${safePath}_${timestamp}`;
      console.log(`Final upload path: ${finalPath}`);
      
      // Tăng số lần retry để cải thiện độ tin cậy
      return storageService.uploadFile(finalPath, fileToUpload, onProgress, onError, 5);
    } catch (error) {
      console.error('Error in uploadImage:', error);
      if (onError) onError(error);
      throw error;
    }
  },
  
  /**
   * Nén ảnh để giảm kích thước file
   * @param {File} imageFile File ảnh cần nén
   * @param {number} maxWidth Chiều rộng tối đa sau khi nén
   * @returns {Promise<File>} File ảnh đã nén
   */
  compressImage: (imageFile, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          
          img.onload = () => {
            // Tính toán kích thước mới giữ nguyên tỷ lệ
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }
            
            // Tạo canvas để vẽ ảnh đã resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Vẽ ảnh lên canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Chuyển canvas thành blob
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Không thể tạo blob từ ảnh'));
                return;
              }
              
              // Tạo file mới từ blob
              const newFile = new File([blob], imageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              resolve(newFile);
            }, 'image/jpeg', 0.85); // 0.85 là chất lượng nén (0-1)
          };
          
          img.onerror = () => {
            reject(new Error('Lỗi khi tải ảnh để nén'));
          };
        };
        
        reader.onerror = () => {
          reject(new Error('Lỗi khi đọc file ảnh'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default storageService; 