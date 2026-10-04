import React, { useState } from "react";
import {
    NativeSyntheticEvent,
    Text,
    TextInput,
    TextInputFocusEventData,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { AlertCircleIcon } from "@/src/components/icons";

interface AuthInputProps extends TextInputProps {
    label: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightAction?: React.ReactNode;
    containerClassName?: string;
}

export const AuthInput = React.forwardRef<TextInput, AuthInputProps>(
    (
        {
            label,
            error,
            leftIcon,
            rightAction,
            containerClassName = "",
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        const handleFocus: TextInputProps["onFocus"] = (e) => {
            setIsFocused(true);
            onFocus?.(e);
        };

        const handleBlur: TextInputProps["onBlur"] = (e) => {
            setIsFocused(false);
            onBlur?.(e);
        };

        const hasError = !!error;

        return (
            <View className={`w-full ${containerClassName}`}>
                {/* Field Label */}
                <Text className="mb-1.5 text-xs font-semibold tracking-wide text-slate-700 uppercase">
                    {label}
                </Text>

                {/* Input Container */}
                <View
                    className={`h-12 flex-row items-center rounded-xl border px-3.5 transition-all ${
                        hasError
                            ? "border-rose-400 bg-rose-50/30"
                            : isFocused
                            ? "border-blue-500 bg-blue-50/20"
                            : "border-slate-200 bg-white"
                    }`}
                >
                    {/* Left Icon */}
                    {leftIcon && <View className="mr-2.5 items-center justify-center">{leftIcon}</View>}

                    {/* Text Input */}
                    <TextInput
                        ref={ref}
                        placeholderTextColor="#94a3b8"
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="flex-1 text-base text-slate-900"
                        {...props}
                    />

                    {/* Right Action / Trailing Slot */}
                    {rightAction && <View className="ml-2 items-center justify-center">{rightAction}</View>}
                </View>

                {/* Validation Error Message */}
                {hasError && (
                    <View className="mt-1.5 flex-row items-center gap-1.5 px-0.5">
                        <AlertCircleIcon size={13} color="#e11d48" />
                        <Text className="text-xs font-medium text-rose-600">
                            {error}
                        </Text>
                    </View>
                )}
            </View>
        );
    }
);

AuthInput.displayName = "AuthInput";
