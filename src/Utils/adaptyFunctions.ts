import { PostgrestError, User } from "@supabase/supabase-js";
import { isPast, addMonths } from "date-fns";
import { isNull, isUndefined } from "lodash";
import { adapty } from "react-native-adapty";
import { supabase } from "./supabase";

const basicTierUser = async () => {
  const profile = await adapty.getProfile();
  return profile.accessLevels?.basic_tier;
};

interface UpdatePhoneticUsage {
  monthly_request_count?: number;
  reset_monthly_requests_date?: Date;
  updated_at?: Date;
}

const updatePhoneticUsage = async (user: User, props: UpdatePhoneticUsage) => {
  const updates: Partial<UpdatePhoneticUsage> = {
    updated_at: new Date(),
    ...(!isUndefined(props.monthly_request_count) && { monthly_request_count: props.monthly_request_count }),
    ...(!isUndefined(props.reset_monthly_requests_date) && { reset_monthly_requests_date: props.reset_monthly_requests_date }),
  };

  const { error } = await supabase
    .from("PhoneticUsage")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating PhoneticUsage:", error.message);
  }

  return error;
};

interface FetchPhoneticUsage {
  data: {
    monthly_request_count: number;
    total_request_count: number;
    reset_monthly_requests_date: Date | null;
  } | null;
  error: PostgrestError | null;
}

const fetchPhoneticUsage = async (user: User): Promise<FetchPhoneticUsage> => {
  const { data, error } = await supabase
    .from("PhoneticUsage")
    .select("monthly_request_count, total_request_count, reset_monthly_requests_date")
    .eq("user_id", user.id.toString())
    .single();

  if (error) {
    console.error("Error fetching PhoneticUsage:", error.message);
  }

  return { data, error };
};

const fetchResetDate = async (user: User): Promise<Date | null> => {
  const basicUser = await basicTierUser();
  return basicUser?.isActive
    ? basicUser.expiresAt ?? basicUser.activatedAt
    : (await fetchPhoneticUsage(user)).data?.reset_monthly_requests_date ?? null;
};

interface ResetCredits {
  onMount: boolean;
  DBUpdate: boolean;
  user: User;
}

const resetCredits = async ({ onMount, DBUpdate, user }: ResetCredits): Promise<Date | null> => {
  const resetDate = await fetchResetDate(user);
  const newResetDate = addMonths(new Date(), 1);

  // if onmount and resetdate is expired
  if (onMount && (resetDate && isPast(resetDate))) {
    if (DBUpdate) {
      await updatePhoneticUsage(user, {
        reset_monthly_requests_date: newResetDate,
        monthly_request_count: 0,
      });
    }
    return null;
  }

  // if resetdate is expired or null
  if (!onMount && !resetDate || (resetDate && isPast(resetDate))) {
    if (DBUpdate) {
      await updatePhoneticUsage(user, {
        reset_monthly_requests_date: newResetDate,
        monthly_request_count: 0,
      });
    }
    return newResetDate;
  }

  return null;
};

export { basicTierUser, resetCredits, fetchResetDate, updatePhoneticUsage };
