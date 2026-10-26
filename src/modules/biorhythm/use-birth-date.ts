"use client";

import { useMemo } from "react";
import { isValidBirthDate, parseDateKey } from "@/lib/date";
import { useAppState } from "@/modules/session/store";

export function useBirthDate(): Date | null {
  const birth = useAppState((state) => state.profile.birth);
  return useMemo(() => (isValidBirthDate(birth) ? parseDateKey(birth) : null), [birth]);
}
