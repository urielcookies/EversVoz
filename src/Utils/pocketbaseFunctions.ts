import AsyncStorage from '@react-native-async-storage/async-storage';
import { pb, pbAdmin, authenticateSuperuser } from './pocketbase';

const collections = {
  USERS: 'eversvoz_users',
};

const getUserByEmail = async (email: string) => {
  try {
    await authenticateSuperuser();
    const user = await pbAdmin
      .collection(collections.USERS)
      .getFirstListItem(`email="${email}"`);
    return user;
  } catch (err: any) {
    console.warn('User not found:', err.message || err);
    return null;
  }
};

const createUserAccount = async (email: string, password: string) => {
  try {
    const data = {
      email,
      password,
      passwordConfirm: password,
    };

    const record = await pb.collection(collections.USERS).create(data);
    return record;
  } catch (err: any) {
    console.error('Error creating user:', err.message || err);
    throw err;
  }
};

const loginUser = async (email: string, password: string) => {
  try {
    const authData = await pb
      .collection(collections.USERS)
      .authWithPassword(email, password);

    return authData;
  } catch (err: any) {
    console.error('Login failed:', err.message || err);
    throw err;
  }
};

const logoutUser = async () => {
  try {
    pb.authStore.clear(); // Clear in-memory session
    await AsyncStorage.removeItem('pb_auth'); // Remove saved session
  } catch (err) {
    console.error('Logout failed:', err);
  }
};

export { getUserByEmail, createUserAccount, loginUser, logoutUser };
