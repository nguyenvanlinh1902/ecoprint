import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, storage } from '../../config/firebase';
import { isAdminEmail, ROLES } from '../../constants/roles';
import storageService from '../../services/storageService';

// Khởi tạo state
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
  success: false,
  role: null,
};

/**
 * Xác định vai trò người dùng dựa trên email
 * @param {Object} user - Đối tượng user từ Firebase Auth
 * @returns {string} - Vai trò người dùng (admin hoặc user)
 */
const determineUserRole = (user) => {
  if (!user || !user.email) return null;
  return isAdminEmail(user.email) ? ROLES.ADMIN : ROLES.USER;
};

// Thunk actions
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = determineUserRole(userCredential.user);
      return {
        ...userCredential.user,
        role
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const role = determineUserRole(userCredential.user);
      return {
        ...userCredential.user,
        role
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const role = determineUserRole(userCredential.user);
      return {
        ...userCredential.user,
        role
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return email;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      await firebaseConfirmPasswordReset(auth, token, newPassword);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const role = determineUserRole(user);
          resolve({
            ...user,
            role
          });
        } else {
          resolve(null);
        }
        unsubscribe();
      });
    });
  }
);

// Thêm thunks mới để cập nhật hồ sơ
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      
      if (!user) {
        throw new Error('Người dùng chưa đăng nhập');
      }
      
      console.log('updateProfile - Dữ liệu nhận được:', profileData);
      
      // Cập nhật tên hiển thị trong Firebase Auth
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: profileData.displayName
      });
      
      // Cập nhật thông tin chi tiết trong Firestore
      const userRef = doc(db, 'users', user.uid);
      
      // Kiểm tra xem user doc đã tồn tại chưa
      const userDoc = await getDoc(userRef);
      
      const userData = {
        displayName: profileData.displayName,
        phone: profileData.phone, // Đảm bảo dùng đúng tên field 'phone' thay vì 'phoneNumber'
        company: profileData.company,
        position: profileData.position,
        address: profileData.address,
        updatedAt: new Date()
      };
      
      console.log('updateProfile - Dữ liệu sẽ lưu vào Firestore:', userData);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, userData);
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          ...userData,
          role: user.role || ROLES.USER,
          createdAt: new Date()
        });
      }
      
      // Trả về dữ liệu hồ sơ đã cập nhật
      return {
        ...user,
        ...userData
      };
    } catch (error) {
      console.error('Lỗi cập nhật profile chi tiết:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (file, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      
      if (!user) {
        throw new Error('Người dùng chưa đăng nhập');
      }
      
      console.log('updateAvatar - Bắt đầu upload ảnh');
      
      // Upload ảnh lên Firebase Storage sử dụng storageService
      const avatarPath = `avatars/${user.uid}`;
      const downloadURL = await storageService.uploadImage(avatarPath, file, 
        (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          console.error('Lỗi trong quá trình upload:', error);
        }
      );
      
      console.log('updateAvatar - Ảnh đã được upload, URL:', downloadURL);
      
      // Cập nhật photoURL trong Firebase Auth
      await firebaseUpdateProfile(auth.currentUser, {
        photoURL: downloadURL
      });
      
      console.log('updateAvatar - Đã cập nhật Firebase Auth');
      
      // Cập nhật photoURL trong Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updatedAt: new Date()
      });
      
      console.log('updateAvatar - Đã cập nhật Firestore');
      
      // Trả về URL mới
      return downloadURL;
    } catch (error) {
      console.error('Lỗi cập nhật avatar:', error);
      return rejectWithValue(error.message || 'Không thể cập nhật ảnh đại diện');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.role = action.payload.role;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.role = action.payload.role;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Confirm Password Reset
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(confirmPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(confirmPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.role = action.payload?.role || null;
      })
      
      // Thêm các reducers cho updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          ...action.payload
        };
        state.error = null;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add reducers cho updateAvatar
      .addCase(updateAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          photoURL: action.payload
        };
        state.error = null;
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = authSlice.actions;

export default authSlice.reducer; 