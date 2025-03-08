import admin from 'firebase-admin';

/**
 * Verify if a user is already verified
 * @param {string} userId User ID to check
 * @returns {Promise<boolean>} Returns true if verified, false if not
 */
export const isUserVerified = async (userId) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return false;
    }
    return userDoc.data().isVerified === true;
  } catch (error) {
    console.error('Error checking user verification status:', error);
    return false;
  }
};

/**
 * Set admin role for a user
 * @param {string} userId User ID to make admin
 * @returns {Promise<boolean>} Success status
 */
export const setAdminRole = async (userId) => {
  try {
    // Get user record
    const userRecord = await admin.auth().getUser(userId);
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    
    // Update user in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error setting admin role:', error);
    return false;
  }
};

/**
 * Remove admin role from a user
 * @param {string} userId User ID to remove admin from
 * @returns {Promise<boolean>} Success status
 */
export const removeAdminRole = async (userId) => {
  try {
    // Get user record
    const userRecord = await admin.auth().getUser(userId);
    
    // Set custom claim - remove admin
    await admin.auth().setCustomUserClaims(userId, { admin: false });
    
    // Update user in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      role: 'user',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
};

/**
 * Check if a user exists by email
 * @param {string} email Email to check
 * @returns {Promise<Object|null>} User record or null
 */
export const findUserByEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
};

/**
 * Create a custom token for a user
 * @param {string} userId User ID
 * @returns {Promise<string|null>} Custom token or null
 */
export const createCustomToken = async (userId) => {
  try {
    const token = await admin.auth().createCustomToken(userId);
    return token;
  } catch (error) {
    console.error('Error creating custom token:', error);
    return null;
  }
}; 