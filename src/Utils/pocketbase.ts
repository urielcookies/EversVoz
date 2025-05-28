import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = process.env.EXPO_PUBLIC_POCKETBASE_API as string;
const superuserEmail = process.env.EXPO_PUBLIC_POCKETBASE_SUPERUSER_EMAIL as string;
const superuserPassword = process.env.EXPO_PUBLIC_POCKETBASE_SUPERUSER_PASSWORD as string;

const pb = new PocketBase(baseUrl);

// Load saved session from AsyncStorage
(async () => {
  const saved = await AsyncStorage.getItem('pb_auth');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      pb.authStore.save(data.token, data.record);
    } catch (e) {
      console.error('Failed to parse stored PocketBase auth:', e);
    }
  }

  pb.authStore.onChange(() => {
    const raw = {
      token: pb.authStore.token,
      record: pb.authStore.record,
    };

    console.log('Saving to AsyncStorage:', raw);
    AsyncStorage.setItem('pb_auth', JSON.stringify(raw));
  });
})();

// Admin client (no AsyncStorage)
const pbAdmin = new PocketBase(baseUrl);

// Superuser login
export const authenticateSuperuser = async () => {
  if (!pbAdmin.authStore.isValid || pbAdmin.authStore.record?.email !== superuserEmail) {
    await pbAdmin.collection('_superusers').authWithPassword(superuserEmail, superuserPassword);
  }
};

export { pb, pbAdmin };
