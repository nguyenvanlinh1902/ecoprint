/**
 * File quản lý phân quyền người dùng trong hệ thống
 */

// Danh sách email có quyền admin
export const ADMIN_EMAILS = [
  'linhnguyenvan1902@gmail.com',
  // Thêm email admin khác tại đây nếu cần
];

// Các vai trò trong hệ thống
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Kiểm tra email có phải là admin hay không
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean} - True nếu là admin, ngược lại là false
 */
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}; 