import React from "react";
import { Text, TextInput, View } from "react-native";
import { AlertCircleIcon } from "@/src/components/icons";

export interface FormFieldProps {
    label: string;
    required?: boolean;
    value?: string | null;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: string;
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
    editable?: boolean;
    helperText?: string;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function FormField({
    label,
    required = false,
    value = "",
    onChangeText,
    onBlur,
    placeholder,
    error,
    maxLength,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    helperText,
    autoCapitalize = "sentences",
    leftIcon,
    rightIcon,
}: FormFieldProps) {
    const stringValue = value ?? "";

    return (
        <View className="w-full">
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs font-bold text-slate-700">
                    {label} {required && <Text className="text-rose-500">*</Text>}
                </Text>
                {maxLength && (
                    <Text className="text-[10px] text-slate-400 font-medium">
                        {stringValue.length}/{maxLength}
                    </Text>
                )}
            </View>

            <View
                className={`flex-row items-center rounded-xl border bg-slate-50 px-3.5 ${
                    multiline ? "py-2.5 min-h-[85px] items-start" : "h-11"
                } ${
                    error
                        ? "border-rose-400 bg-rose-50/40"
                        : "border-slate-200 focus-within:border-blue-500 focus-within:bg-white"
                } ${!editable ? "opacity-60 bg-slate-100" : ""}`}
            >
                {leftIcon && <View className="mr-2">{leftIcon}</View>}

                <TextInput
                    value={stringValue}
                    onChangeText={onChangeText}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? "top" : "center"}
                    editable={editable}
                    autoCapitalize={autoCapitalize}
                    className="flex-1 text-sm font-medium text-slate-900"
                />

                {rightIcon && <View className="ml-2">{rightIcon}</View>}
            </View>

            {error ? (
                <View className="flex-row items-center gap-1.5 mt-1">
                    <AlertCircleIcon size={12} color="#e11d48" />
                    <Text className="text-[11px] font-medium text-rose-600">
                        {error}
                    </Text>
                </View>
            ) : helperText ? (
                <Text className="text-[11px] text-slate-400 mt-1">
                    {helperText}
                </Text>
            ) : null}
        </View>
    );
}
