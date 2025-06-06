import { PostgrestError, User } from "@supabase/supabase-js";
import { isPast, addMonths, getDate, setDate, isBefore } from "date-fns";
import { isUndefined } from "lodash";
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

// Function to calculate the correct next renewal date
const getNextRenewalDate = (lastRenewal: Date | null): Date => {
  if (!lastRenewal) return addMonths(new Date(), 1); // Default to next month if no last renewal

  let nextRenewal = new Date(lastRenewal);
  const renewalDay = getDate(nextRenewal); // Keep the same day
  const today = new Date();

  // Keep adding months until we get a renewal date in the future
  while (isBefore(nextRenewal, today)) {
    nextRenewal = addMonths(nextRenewal, 1);
    nextRenewal = setDate(nextRenewal, renewalDay); // Ensure the correct renewal day
  }

  return nextRenewal;
};

interface ResetCredits {
  onMount: boolean;
  DBUpdate: boolean;
  user: User;
}

const resetCredits = async ({ onMount, DBUpdate, user }: ResetCredits): Promise<Date | null> => {
  const resetDate = await fetchResetDate(user);
  const newResetDate = getNextRenewalDate(resetDate);

  // If onMount and resetDate is expired
  if (onMount && resetDate && isPast(resetDate)) {
    if (DBUpdate) {
      await updatePhoneticUsage(user, {
        reset_monthly_requests_date: newResetDate,
        monthly_request_count: 0,
      });
    }
    return null;
  }

  // If resetDate is expired or null
  if (!onMount && (!resetDate || isPast(resetDate))) {
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

export { basicTierUser, resetCredits, fetchResetDate, updatePhoneticUsage, fetchPhoneticUsage };
