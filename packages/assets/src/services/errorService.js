/**
 * Xử lý và hiển thị lỗi chung cho ứng dụng
 * @param {Error} error - Lỗi cần xử lý
 */
export const handleError = (error) => {
  console.error('Error occurred:', error);
  
  // Thêm xử lý lỗi phù hợp với ứng dụng ở đây
  // Ví dụ: hiển thị thông báo lỗi, gửi lỗi tới dịch vụ giám sát, v.v.
};

export default {
  handleError
}; 