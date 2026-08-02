import type { PropsWithChildren } from "react";

import { Toaster } from "@/shared/components/ui/sonner";

import { QueryProvider } from "./QueryProvider";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <QueryProvider>
            {children}
            <Toaster />
        </QueryProvider>
    );
}