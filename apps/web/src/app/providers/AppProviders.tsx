import type { PropsWithChildren } from "react";

import { Toaster } from "@/shared/components/ui/sonner";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <QueryProvider>
                {children}
                <Toaster />
            </QueryProvider>
        </ThemeProvider>
    );
}