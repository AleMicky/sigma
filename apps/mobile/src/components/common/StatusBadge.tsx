import React from "react";
import { Badge, BadgeText } from "@/src/components/ui/badge";

export type StatusVariant = "default" | "success" | "warning" | "destructive" | "secondary" | "outline";

export interface StatusBadgeProps {
    status?: string | null;
    label?: string;
    variant?: StatusVariant;
    className?: string;
}

export function StatusBadge({
    status,
    label,
    variant,
    className = "",
}: StatusBadgeProps) {
    const raw = (status || label || "N/A").toUpperCase();

    // Determine variant and human-friendly label
    let finalVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let customBg = "bg-slate-100 text-slate-700 border-slate-200";

    if (
        raw.includes("FINALIZAD") ||
        raw.includes("COMPLETAD") ||
        raw.includes("CONCLUID") ||
        raw.includes("APROBAD") ||
        raw.includes("ACTIVO") ||
        variant === "success"
    ) {
        customBg = "bg-emerald-50 border-emerald-200";
    } else if (
        raw.includes("PROCESO") ||
        raw.includes("EJECUCION") ||
        raw.includes("CURSO") ||
        raw.includes("REVISION") ||
        variant === "default"
    ) {
        customBg = "bg-blue-50 border-blue-200";
    } else if (
        raw.includes("URGENTE") ||
        raw.includes("CRITIC") ||
        raw.includes("RECHAZAD") ||
        raw.includes("FALLA") ||
        variant === "destructive"
    ) {
        finalVariant = "destructive";
        customBg = "bg-rose-50 border-rose-200";
    } else if (
        raw.includes("ALTA") ||
        raw.includes("PENDIENTE") ||
        raw.includes("BORRADOR") ||
        variant === "warning"
    ) {
        customBg = "bg-amber-50 border-amber-200";
    }

    const textStyle =
        finalVariant === "destructive"
            ? "text-rose-700 font-bold"
            : customBg.includes("emerald")
            ? "text-emerald-700 font-bold"
            : customBg.includes("blue")
            ? "text-blue-700 font-bold"
            : customBg.includes("amber")
            ? "text-amber-700 font-bold"
            : "text-slate-700 font-bold";

    return (
        <Badge
            variant={finalVariant}
            className={`rounded-full px-2.5 py-0.5 border ${customBg} ${className}`}
        >
            <BadgeText className={`text-[11px] uppercase tracking-wider ${textStyle}`}>
                {label || raw.replace(/_/g, " ")}
            </BadgeText>
        </Badge>
    );
}
