import { adapty } from "react-native-adapty";
import { isNull } from "lodash";
import { User } from '@supabase/supabase-js';

const creditRenewalDate = async (user: User) => {
  const profile = await adapty.getProfile();
  let renewalDate = user.created_at;
  const basicTier = profile.accessLevels?.basic_tier;
  if (basicTier) {
    const { renewedAt, activatedAt } = basicTier;
    renewalDate = String(renewedAt) ?? (activatedAt ?? renewalDate);
  }
  return renewalDate;
}

const basicTierUser = async () => {
  const profile = await adapty.getProfile();
  return profile.accessLevels?.basic_tier;
}

export { creditRenewalDate, basicTierUser };
