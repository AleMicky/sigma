import type { PropsWithChildren } from "react";

import { ErrorBoundary } from "@/shared/components/error-boundary";
import { Toaster } from "@/shared/components/ui/sonner";

import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <ErrorBoundary>
                <QueryProvider>
                    {children}
                    <Toaster />
                </QueryProvider>
            </ErrorBoundary>
        </ThemeProvider>
    );
}