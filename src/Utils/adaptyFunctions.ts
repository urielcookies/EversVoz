import { PostgrestError, User } from "@supabase/supabase-js";
import { isPast, addMonths } from "date-fns";
import { isNull } from "lodash";
import { adapty } from "react-native-adapty";
import { supabase } from "./supabase";

const basicTierUser = async () => {
  const profile = await adapty.getProfile();
  return profile.accessLevels?.basic_tier;
}

interface ResetCredits {
  data: { reset_monthly_requests_date: Date | null } | null;
  error: PostgrestError | null;
}

type IsExpired = Date | PostgrestError | null

const resetCredits = async (user: User, initial?: boolean): Promise<IsExpired> => {
  const { data, error }: ResetCredits = await supabase
    .from('PhoneticUsage')
    .select('reset_monthly_requests_date')
    .eq('user_id', user.id.toString())
    .single();

  if (error) {
    console.error('Error fetching usage data:', error.message);
    return error;
  }

  if (data) {
    const resetDate = data.reset_monthly_requests_date;
    let newResetDate = addMonths(new Date(), 1);
    if (resetDate && isPast(new Date(resetDate))) {
      const basicUser = await basicTierUser();
      if (basicUser?.isActive) {
        newResetDate = basicUser.renewedAt ?? basicUser?.activatedAt
      }

      if (initial) {
        const { error } = await supabase
          .from('PhoneticUsage')
          .update({ 
            monthly_request_count: 0,
            reset_monthly_requests_date: newResetDate,
            updated_at: new Date(),
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error inserting data:', error.message);
          return error
        }
      }

      return newResetDate;
    }

    if (isNull(resetDate) && !initial) {
      return newResetDate
    }
  }
  return null;
};

export type { IsExpired }
export { basicTierUser, resetCredits };
