import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeftIcon } from "@/src/components/icons";

export interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    rightAction?: {
        label?: string;
        icon?: React.ReactNode;
        onPress: () => void;
        loading?: boolean;
        disabled?: boolean;
        variant?: "primary" | "secondary" | "ghost";
    };
    rightNode?: React.ReactNode;
    theme?: "light" | "dark";
    className?: string;
    badgeCount?: number;
}

export function ScreenHeader({
    title,
    subtitle,
    showBackButton = true,
    onBack,
    rightAction,
    rightNode,
    theme = "light",
    className = "",
    badgeCount,
}: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();
    const isDark = theme === "dark";

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View
            style={{ paddingTop: Math.max(insets.top, 12) }}
            className={`px-4 pb-3 border-b ${
                isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200/80 shadow-xs"
            } ${className}`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1 mr-3">
                    {showBackButton && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleBack}
                            accessibilityLabel="Regresar"
                            className={`h-9 w-9 items-center justify-center rounded-full ${
                                isDark
                                    ? "bg-slate-800 active:bg-slate-700"
                                    : "bg-slate-100 active:bg-slate-200"
                            }`}
                        >
                            <ArrowLeftIcon
                                size={18}
                                color={isDark ? "#ffffff" : "#0f172a"}
                            />
                        </TouchableOpacity>
                    )}

                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text
                                numberOfLines={1}
                                className={`text-lg font-black tracking-tight ${
                                    isDark ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {title}
                            </Text>
                            {typeof badgeCount === "number" && badgeCount > 0 && (
                                <View className="rounded-full bg-blue-50 px-2 py-0.5 border border-blue-100">
                                    <Text className="text-[10px] font-bold text-blue-700">
                                        {badgeCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {subtitle && (
                            <Text
                                numberOfLines={1}
                                className={`text-[11px] font-medium ${
                                    isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {rightNode ? (
                    rightNode
                ) : rightAction ? (
                    <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={rightAction.onPress}
                        disabled={rightAction.disabled || rightAction.loading}
                        className={`rounded-full px-3.5 py-1.5 flex-row items-center gap-1.5 ${
                            rightAction.variant === "primary"
                                ? "bg-blue-600 active:bg-blue-700"
                                : rightAction.variant === "secondary"
                                ? "bg-blue-50 border border-blue-200 active:bg-blue-100"
                                : "bg-transparent active:bg-slate-100"
                        } ${rightAction.disabled ? "opacity-50" : ""}`}
                    >
                        {rightAction.loading ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    rightAction.variant === "primary"
                                        ? "#ffffff"
                                        : "#2563eb"
                                }
                            />
                        ) : (
                            <>
                                {rightAction.icon}
                                {rightAction.label && (
                                    <Text
                                        className={`text-xs font-bold ${
                                            rightAction.variant === "primary"
                                                ? "text-white"
                                                : "text-blue-700"
                                        }`}
                                    >
                                        {rightAction.label}
                                    </Text>
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}
