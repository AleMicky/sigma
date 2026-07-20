package com.endecorani.sigma_api.shared.util;

public final class StringUtils {

    private StringUtils() {
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static String trimToNull(String value) {
        if (isBlank(value)) {
            return null;
        }

        return value.trim();
    }

    public static String normalize(String value) {
        if (isBlank(value)) {
            return null;
        }

        return value
                .trim()
                .replaceAll("\\s+", " ");
    }
}
