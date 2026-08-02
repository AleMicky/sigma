import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "./auth.service";
import { authKeys } from "./auth.keys";

 
export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: getCurrentUser,
    }),
};