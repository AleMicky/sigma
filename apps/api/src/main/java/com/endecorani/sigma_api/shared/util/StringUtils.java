package com.endecorani.sigma_api.shared.util;

import java.text.Normalizer;
import java.util.Locale;

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

    public static String normalizeUpperCase(
            String value
    ) {
        String normalized = normalize(value);

        if (normalized == null) {
            return null;
        }

        return normalized.toUpperCase(
                Locale.ROOT
        );
    }

    public static String removeAccents(
            String value
    ) {
        if (value == null) {
            return null;
        }

        return Normalizer
                .normalize(
                        value,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "");
    }
}