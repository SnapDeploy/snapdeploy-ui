import { useUser as useClerkUser } from "@clerk/clerk-react";

export function useUser() {
  return useClerkUser();
}

