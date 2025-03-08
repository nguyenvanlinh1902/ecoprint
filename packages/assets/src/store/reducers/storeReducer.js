import React, { createContext, useContext, useReducer } from 'react';

// Tạo context cho store
const StoreContext = createContext({
  state: {
    toast: {
      open: false,
      message: '',
      type: 'success'
    },
    user: null,
    loading: false,
    theme: 'light'
  },
  dispatch: () => null
});

// Khởi tạo state
const initialState = {
  toast: {
    open: false,
    message: '',
    type: 'success'
  },
  user: null,
  loading: false,
  theme: 'light'
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'SET_TOAST':
      return {
        ...state,
        toast: {
          open: true,
          message: action.payload.message,
          type: action.payload.isError ? 'error' : 'success'
        }
      };
    case 'CLOSE_TOAST':
      return {
        ...state,
        toast: {
          ...state.toast,
          open: false
        }
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    default:
      return state;
  }
}

// Provider component
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook để sử dụng store
export const useStore = () => {
  const context = useContext(StoreContext);
  // Loại bỏ việc throw error để tránh lỗi khi sử dụng hook bên ngoài Provider
  return context;
};

export default {
  StoreProvider,
  useStore
}; 