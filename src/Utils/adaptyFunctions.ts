import { adapty } from "react-native-adapty";

const basicTierUser = async () => {
  const profile = await adapty.getProfile();
  return profile.accessLevels?.basic_tier;
}

export { basicTierUser };
