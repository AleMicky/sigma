package com.endecorani.sigma_api.shared.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

public final class DateTimeUtils {

    private DateTimeUtils() {
    }

    public static Instant nowUtc() {
        return Instant.now();
    }

    public static Instant toInstant(
            LocalDateTime dateTime
    ) {
        if (dateTime == null) {
            return null;
        }

        return dateTime.toInstant(
                ZoneOffset.UTC
        );
    }

    public static LocalDateTime toLocalDateTime(
            Instant instant,
            ZoneId zoneId
    ) {
        if (instant == null) {
            return null;
        }

        return LocalDateTime.ofInstant(
                instant,
                zoneId
        );
    }

    public static Instant startOfDayUtc(
            LocalDate date
    ) {
        if (date == null) {
            return null;
        }

        return date
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();
    }

    public static Instant endOfDayUtc(
            LocalDate date
    ) {
        if (date == null) {
            return null;
        }

        return date
                .plusDays(1)
                .atStartOfDay(ZoneOffset.UTC)
                .minusNanos(1)
                .toInstant();
    }
}