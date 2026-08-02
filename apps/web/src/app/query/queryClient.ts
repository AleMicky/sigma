import { QueryClient } from "@tanstack/react-query";

import { queryDefaultOptions } from "./query-options";

export const queryClient = new QueryClient({
    defaultOptions: queryDefaultOptions,
});