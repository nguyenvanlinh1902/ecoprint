/**
 * Hiển thị toast thông báo
 * @param {Function} dispatch - Dispatch function từ useReducer
 * @param {string} message - Nội dung thông báo
 * @param {boolean} isError - Loại thông báo (error hay success)
 */
export const setToast = (dispatch, message, isError = false) => {
  dispatch({
    type: 'SET_TOAST',
    payload: { message, isError }
  });
  
  // Tự động đóng toast sau 3 giây
  setTimeout(() => {
    dispatch({ type: 'CLOSE_TOAST' });
  }, 3000);
};

/**
 * Đóng toast thông báo
 * @param {Function} dispatch - Dispatch function từ useReducer
 */
export const closeToast = (dispatch) => {
  dispatch({ type: 'CLOSE_TOAST' });
};

/**
 * Lưu thông tin người dùng vào store
 * @param {Function} dispatch - Dispatch function từ useReducer
 * @param {Object} user - Thông tin người dùng
 */
export const setUser = (dispatch, user) => {
  dispatch({
    type: 'SET_USER',
    payload: user
  });
};

/**
 * Cập nhật trạng thái loading toàn cục
 * @param {Function} dispatch - Dispatch function từ useReducer
 * @param {boolean} loading - Trạng thái loading
 */
export const setLoading = (dispatch, loading) => {
  dispatch({
    type: 'SET_LOADING',
    payload: loading
  });
};

/**
 * Thay đổi theme của ứng dụng
 * @param {Function} dispatch - Dispatch function từ useReducer
 * @param {string} theme - Theme muốn đổi (light/dark)
 */
export const setTheme = (dispatch, theme) => {
  dispatch({
    type: 'SET_THEME',
    payload: theme
  });
};

export default {
  setToast,
  closeToast,
  setUser,
  setLoading,
  setTheme
}; 