import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/src/components/ui/card";
import { Button, ButtonText } from "@/src/components/ui/button";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
    className = "",
}: EmptyStateProps) {
    return (
        <Card
            className={`my-6 rounded-3xl bg-white p-8 items-center border border-slate-200/90 shadow-2xs ${className}`}
        >
            {icon && (
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80 mb-3 border border-blue-100">
                    {icon}
                </View>
            )}

            <Text className="text-base font-bold text-slate-900 text-center">
                {title}
            </Text>

            {description && (
                <Text className="text-xs text-slate-500 text-center mt-1 leading-relaxed max-w-[280px]">
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    onPress={onAction}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 shadow-sm active:bg-blue-700"
                >
                    {actionIcon}
                    <ButtonText className="text-xs font-bold text-white">
                        {actionLabel}
                    </ButtonText>
                </Button>
            )}
        </Card>
    );
}
